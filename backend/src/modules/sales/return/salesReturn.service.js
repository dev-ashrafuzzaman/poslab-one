import { ObjectId } from "mongodb";
import { RETURN_STATUS } from "./salesReturn.constants.js";
import {
  salesReturnAccounting,
  salesReturnCogsAccounting,
} from "../../accounting/accounting.adapter.js";
import { roundMoney } from "../../../utils/money.js";
import { writeAuditLog } from "../../../utils/logger.js";
import { COLLECTIONS } from "../../../database/collections.js";
import { restoreStockFIFO } from "../../inventory/restoreStockFIFO.js";
import { reverseSaleCommission } from "../commission.service.js";
import { createSaleService } from "../sales.service.js";
import { ensureObjectId } from "../../../utils/ensureObjectId.js";
import { resolveBranch } from "../../../utils/resolveBranch.js";
import { generateCode } from "../../../utils/codeGenerator.js";
import { getDB } from "../../../config/db.js";

export const createSalesReturnService = async ({
  db,
  saleId,
  payload,
  user,
  session: externalSession,
}) => {
  const session = externalSession || db.client.startSession();
  const ownSession = !externalSession;

  try {
    if (ownSession) session.startTransaction();

    /* =====================
       1️⃣ BASIC SETUP
    ====================== */
    const saleObjectId = ensureObjectId(saleId, "saleId");
    const userId = ensureObjectId(user._id, "userId");

    const sale = await db
      .collection(COLLECTIONS.SALES)
      .findOne({ _id: saleObjectId }, { session });

    if (!sale) throw new Error("Sale not found");

    const branch = await resolveBranch({ db, user, session });
    const branchId = ensureObjectId(sale.branchId, "branchId");
    const customerId = sale.customerId ? ensureObjectId(sale.customerId) : null;

    const saleItems = await db
      .collection(COLLECTIONS.SALE_ITEMS)
      .find({ saleId: sale._id }, { session })
      .toArray();

    if (!saleItems.length) {
      throw new Error("Sale items not found");
    }

    const saleItemMap = new Map(saleItems.map((i) => [i._id.toString(), i]));

    /* =====================
       2️⃣ RETURN INVOICE
    ====================== */
    const returnInvoiceNo = await generateCode({
      db,
      module: "SALES_RETURN",
      prefix: "SR",
      scope: "YEAR",
      branch: branch.code,
      padding: 5,
      session,
    });

    /* =====================
       3️⃣ TOTALS INIT
    ====================== */
    let returnGrossTotal = 0;
    let returnDiscountTotal = 0;
    let returnVatTotal = 0;
    let refundAmountTotal = 0;
    let totalReturnCogs = 0;
    let totalReturnQty = 0;

    /* =====================
       4️⃣ CREATE RETURN MASTER
    ====================== */
    const { insertedId: salesReturnId } = await db
      .collection(COLLECTIONS.SALES_RETURNS)
      .insertOne(
        {
          saleId: sale._id,
          invoiceNo: sale.invoiceNo,
          returnInvoiceNo,
          branchId,
          refundMethod: payload.refundMethod,
          createdBy: userId,
          createdAt: new Date(),
          status: RETURN_STATUS.PARTIAL, // temp
        },
        { session },
      );

    /* =====================
   5️⃣ PROCESS EACH ITEM (OPTIMIZED)
====================== */

    for (const r of payload.items) {
      const saleItem = saleItemMap.get(r.saleItemId?.toString());
      if (!saleItem) {
        throw new Error("Invalid saleItemId");
      }

      /* ---------- RETURN QTY VALIDATION (MULTI RETURN SAFE) ---------- */
      const returnQty = Number(r.qty);

      const alreadyReturnedQty = saleItem.returnedQty || 0;
      const remainingQty = saleItem.qty - alreadyReturnedQty;

      if (
        !Number.isFinite(returnQty) ||
        returnQty <= 0 ||
        returnQty > remainingQty
      ) {
        throw new Error(
          `Invalid return quantity. Remaining allowed: ${remainingQty}`,
        );
      }

      totalReturnQty += returnQty;

      /* ---------- GROSS ---------- */
      const unitGross = roundMoney(Number(saleItem.salePrice || 0));
      const returnGross = roundMoney(unitGross * returnQty);

      /* ---------- ITEM DISCOUNT (NEW STRUCTURE SAFE) ---------- */
      const totalItemDiscount = Number(saleItem.discount?.amount || 0);

      const unitItemDiscount =
        saleItem.qty > 0 ? roundMoney(totalItemDiscount / saleItem.qty) : 0;

      const returnItemDiscount = roundMoney(unitItemDiscount * returnQty);

      /* ---------- BILL DISCOUNT (PROPORTIONAL SAFE) ---------- */
      const billDiscountRatio =
        sale.subTotal > 0 ? Number(sale.billDiscount || 0) / sale.subTotal : 0;

      const returnBillDiscount = roundMoney(returnGross * billDiscountRatio);

      /* ---------- VAT (PROPORTIONAL SAFE) ---------- */
      const vatRatio =
        sale.subTotal > 0 ? Number(sale.taxAmount || 0) / sale.subTotal : 0;

      const returnVat = roundMoney(returnGross * vatRatio);

      /* ---------- FINAL REFUND ---------- */
      const refundAmount = roundMoney(
        returnGross - returnItemDiscount - returnBillDiscount + returnVat,
      );

      /* ---------- ACCUMULATE TOTALS ---------- */
      returnGrossTotal += returnGross;
      returnDiscountTotal += returnItemDiscount + returnBillDiscount;
      returnVatTotal += returnVat;
      refundAmountTotal += refundAmount;

      /* ---------- SAVE RETURN ITEM ---------- */
      await db.collection(COLLECTIONS.SALES_RETURN_ITEMS).insertOne(
        {
          salesReturnId,
          saleItemId: saleItem._id,
          productId: saleItem.productId,
          variantId: saleItem.variantId,
          sku: saleItem.sku,
          qty: returnQty,
          returnGross,
          returnDiscount: returnItemDiscount + returnBillDiscount,
          returnVat,
          refundAmount,
          reason: r.reason || null,
          createdAt: new Date(),
        },
        { session },
      );

      /* ---------- UPDATE SALE ITEM RETURNED QTY ---------- */
      await db.collection(COLLECTIONS.SALE_ITEMS).updateOne(
        { _id: saleItem._id },
        {
          $inc: { returnedQty: returnQty },
          $set: { updatedAt: new Date() },
        },
        { session },
      );

      /* ---------- FIFO STOCK RESTORE ---------- */
      const cogs = await restoreStockFIFO({
        db,
        session,
        branchId,
        variantId: saleItem.variantId,
        returnQty,
        salesReturnId,
      });

      totalReturnCogs += cogs;

      /* ---------- STOCK CACHE UPDATE ---------- */
      await db.collection(COLLECTIONS.STOCKS).updateOne(
        { branchId, variantId: saleItem.variantId },
        {
          $inc: { qty: returnQty },
          $set: { updatedAt: new Date() },
        },
        { session },
      );
    }

    /* =====================
       6️⃣ FINAL STATUS
    ====================== */
    const totalReturnedSoFar = (sale.returnedAmount || 0) + refundAmountTotal;

    const status =
      totalReturnedSoFar >= sale.grandTotal
        ? RETURN_STATUS.FULL
        : RETURN_STATUS.PARTIAL;

    await db.collection(COLLECTIONS.SALES_RETURNS).updateOne(
      { _id: salesReturnId },
      {
        $set: {
          refundAmount: refundAmountTotal,
          returnGross: returnGrossTotal,
          returnDiscount: returnDiscountTotal,
          returnVat: returnVatTotal,
          status,
        },
      },
      { session },
    );

    await db.collection(COLLECTIONS.SALES).updateOne(
      { _id: sale._id },
      {
        $inc: { returnedAmount: refundAmountTotal },
        $set: { status, updatedAt: new Date() },
      },
      { session },
    );

    /* =====================
       7️⃣ ACCOUNTING
    ====================== */
    await salesReturnAccounting({
      db,
      session,
      salesReturnId,
      returnGross: returnGrossTotal,
      returnDiscount: returnDiscountTotal,
      returnVat: returnVatTotal,
      refundAmount: refundAmountTotal,
      dueAdjust: payload.refundMethod === "ADJUST_DUE" ? refundAmountTotal : 0,
      customerId,
      branchId,
    });

    await salesReturnCogsAccounting({
      db,
      session,
      salesReturnId,
      cogsAmount: totalReturnCogs,
      branchId,
    });

    /* =====================
       8️⃣ COMMISSION REVERSAL
    ====================== */
    const returnRatio = refundAmountTotal / sale.grandTotal;

    await reverseSaleCommission({
      db,
      session,
      saleId: sale._id,
      salesReturnId,
      returnRatio,
      branchId,
    });

    if (ownSession) await session.commitTransaction();

    return {
      success: true,
      salesReturnId,
      refundAmount: refundAmountTotal,
      returnGross: returnGrossTotal,
      returnDiscount: returnDiscountTotal,
      returnVat: returnVatTotal,
      totalReturnCogs,
      status,
    };
  } catch (err) {
    if (ownSession) await session.abortTransaction();
    throw err;
  } finally {
    if (ownSession) session.endSession();
  }
};

export const createSalesExchangeService = async ({
  db,
  saleId,
  payload,
  user,
}) => {
  const session = db.client.startSession();

  try {
    session.startTransaction();

    /* ========= 1️⃣ SALES RETURN PART ========= */
    const returnResult = await createSalesReturnService({
      db,
      saleId,
      payload: {
        items: payload.returnItems,
        refundMethod: "ADJUST_DUE", // 🔥 no cash
      },
      user,
      session, // 🔥 reuse same transaction
    });

    const returnAmount = returnResult.refundAmount;

    /* ========= 2️⃣ NEW SALE PART ========= */
    const newSaleResult = await createSaleService({
      db,
      payload: payload.newSale,
      user,
      session,
      isExchange: true, // optional flag
    });

    const newSaleTotal = newSaleResult.data.summary.grandTotal;

    /* ========= 3️⃣ NET ADJUST ========= */
    const net = roundMoney(newSaleTotal - returnAmount);

    let settlement = null;

    if (net > 0) {
      settlement = {
        type: "CUSTOMER_PAY",
        amount: net,
      };
    } else if (net < 0) {
      settlement = {
        type: "STORE_CREDIT",
        amount: Math.abs(net),
      };

      await db.collection("store_credits").insertOne(
        {
          customerId: newSaleResult.data.customer.customerId,
          amount: Math.abs(net),
          source: "EXCHANGE",
          refSaleId: newSaleResult.data.sale.saleId,
          createdAt: new Date(),
        },
        { session },
      );
    } else {
      settlement = { type: "EVEN" };
    }

    await session.commitTransaction();

    return {
      success: true,
      message: "Exchange completed successfully",
      data: {
        return: returnResult,
        newSale: newSaleResult.data,
        settlement,
      },
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const getSalesReturns = async (req, res, next) => {
  try {
    const db = getDB();

    const { page = 1, limit = 20, branchId, from, to, status } = req.query;

    const match = {};

    /* ---------- Filters ---------- */
    if (branchId) {
      match.branchId = ensureObjectId(branchId, "branchId");
    }

    if (status) {
      match.status = status; // FULL | PARTIAL
    }

    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const data = await db
      .collection(COLLECTIONS.SALES_RETURNS)
      .aggregate([
        { $match: match },

        /* ---------- Minimal Projection ---------- */
        {
          $project: {
            _id: 1,
            returnInvoiceNo: 1,
            invoiceNo: 1,
            returnDiscount: 1,
            returnGross: 1,
            refundMethod: 1,
            refundAmount: 1,
            status: 1,
            branchId: 1,
            createdAt: 1,
          },
        },

        /* ---------- Optional: customer name only ---------- */
        {
          $lookup: {
            from: COLLECTIONS.CUSTOMERS,
            localField: "customerId",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $unwind: {
            path: "$customer",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            customerName: "$customer.name",
          },
        },
        {
          $project: {
            customer: 0,
          },
        },

        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
      ])
      .toArray();

    const total = await db
      .collection(COLLECTIONS.SALES_RETURNS)
      .countDocuments(match);

    res.json({
      success: true,
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getSingleSalesReturn = async (req, res, next) => {
  try {
    const db = getDB();
    const salesReturnId = ensureObjectId(
      req.params.salesReturnId,
      "salesReturnId",
    );

    const data = await db
      .collection(COLLECTIONS.SALES_RETURNS)
      .aggregate([
        { $match: { _id: salesReturnId } },

        /* ---------- SALE ---------- */
        {
          $lookup: {
            from: COLLECTIONS.SALES,
            localField: "saleId",
            foreignField: "_id",
            as: "sale",
          },
        },
        { $unwind: "$sale" },

        /* ---------- CUSTOMER ---------- */
        {
          $lookup: {
            from: COLLECTIONS.CUSTOMERS,
            localField: "sale.customerId",
            foreignField: "_id",
            as: "customer",
          },
        },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },

        /* ---------- RETURN ITEMS ---------- */
        {
          $lookup: {
            from: COLLECTIONS.SALES_RETURN_ITEMS,
            localField: "_id",
            foreignField: "salesReturnId",
            as: "items",
          },
        },

        /* ---------- PRODUCT INFO ---------- */
        {
          $lookup: {
            from: COLLECTIONS.PRODUCTS,
            localField: "items.productId",
            foreignField: "_id",
            as: "products",
          },
        },

        /* ---------- SHAPE FOR PRINT ---------- */
        {
          $addFields: {
            refundAmount: "$refundAmount",
            originalInvoiceNo: "$sale.invoiceNo",
          },
        },
      ])
      .toArray();

    if (!data.length) {
      return res.status(404).json({
        success: false,
        message: "Sales return not found",
      });
    }

    res.json({
      success: true,
      data: data[0],
    });
  } catch (err) {
    next(err);
  }
};
