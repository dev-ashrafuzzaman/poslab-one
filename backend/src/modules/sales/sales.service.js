import { ObjectId } from "mongodb";
import { generateCode } from "../../utils/codeGenerator.js";
import { SALE_STATUS } from "./sales.constants.js";
import {
  commissionAccrualAccounting,
  salesAccounting,
  salesCogsAccounting,
} from "../accounting/accounting.adapter.js";
import { writeAuditLog } from "../../utils/logger.js";
import {
  calculateSaleCommission,
  createSaleCommission,
} from "./commission.service.js";
import { roundMoney } from "../../utils/money.js";
import { COLLECTIONS } from "../../database/collections.js";
import { resolveBranch } from "../../utils/resolveBranch.js";
import { consumeStockFIFO } from "../inventory/consumeStockFIFO.js";
import { decrementStockCache } from "../inventory/decrementStockCache.js";
import { ensureObjectId } from "../../utils/ensureObjectId.js";
import { upsertCustomerBranch } from "../customers/customerBranch.service.js";
import { addLoyaltyPoints } from "../customers/customerLoyalty.service.js";
import { getDB } from "../../config/db.js";
import { processLoyaltyAfterSale } from "../membership/loyalty.service.js";

export const createSaleService = async ({ db, payload, user }) => {
  const session = db.client.startSession();
  try {
    session.startTransaction();

    /* ---------- BASIC VALIDATION ---------- */
    if (!payload.items?.length) {
      throw new Error("Sale must contain at least one item");
    }
    if (!payload.payments?.length) {
      throw new Error("At least one payment is required");
    }

    /* ---------- BRANCH ---------- */
    const branch = await resolveBranch({ db, user, session });
    const branchId = ensureObjectId(branch._id, "branchId");

    const customerdata = await db
      .collection(COLLECTIONS.CUSTOMERS)
      .findOne(
        { _id: new ObjectId(payload.customerId), status: "active" },
        { session },
      );

    /* ---------- VAT ---------- */

    const vatConfig = await db
      .collection(COLLECTIONS.TAX_CONFIGS)
      .findOne({ appliesTo: "SALE", status: "active" }, { session });
    const vatRate = vatConfig ? Number(vatConfig.rate) : 0;

    /* ---------- INVOICE ---------- */
    const invoiceNo = await generateCode({
      db,
      module: "SALE",
      prefix: "INV",
      scope: "YEAR",
      branch: branch.code,
      padding: 8,
      session,
    });

    /* ---------- PRELOAD VARIANTS ---------- */
    const variantIds = payload.items.map((i) => new ObjectId(i.variantId));

    const variants = await db
      .collection(COLLECTIONS.VARIANTS)
      .find({ _id: { $in: variantIds }, status: "active" }, { session })
      .toArray();

    if (variants.length !== variantIds.length) {
      throw new Error("Invalid or inactive variant found");
    }

    const variantMap = new Map(variants.map((v) => [v._id.toString(), v]));

    /* ---------- CALCULATIONS ---------- */
    let subTotal = 0;
    let itemDiscount = 0;
    let taxAmount = 0;
    const saleItems = [];

    for (const item of payload.items) {
      const variant = variantMap.get(item.variantId);
      const qty = Number(item.qty);
      const price = Number(item.salePrice);

      if (!variant || qty <= 0 || price < 0) {
        throw new Error("Invalid sale item");
      }

      if (item.discountId) {
        const validDiscount = await db
          .collection(COLLECTIONS.DISCOUNTS)
          .findOne(
            {
              _id: new ObjectId(item.discountId),
              status: "active",
            },
            { session },
          );

        if (!validDiscount) {
          throw new Error("Invalid or expired discount applied");
        }
      }

      const base = qty * price;

      let discount = 0;
      if (item.discountType === "PERCENT") {
        discount = (base * Number(item.discountValue || 0)) / 100;
      } else if (item.discountType === "FIXED") {
        discount = Number(item.discountValue || 0);
      }

      discount = Math.min(discount, base);
      const taxable = base - discount;
      const vat = roundMoney(taxable * (vatRate / 100));

      subTotal += base;
      itemDiscount += discount;
      taxAmount += vat;

      saleItems.push({
        saleId: null,
        productId: variant.productId,
        variantId: variant._id,
        sku: variant.sku,
        qty,
        salePrice: price,
        discount: item.discountType
          ? {
              discountId: item.discountId
                ? new ObjectId(item.discountId)
                : null,
              type: item.discountType,
              value: Number(item.discountValue),
              amount: roundMoney(discount),
              source: item.discountId ? "CAMPAIGN" : "MANUAL",
            }
          : null,
        taxAmount: vat,
        lineTotal: roundMoney(taxable + vat),
        createdAt: new Date(),
      });
    }

    subTotal = roundMoney(subTotal);
    itemDiscount = roundMoney(itemDiscount);
    taxAmount = roundMoney(taxAmount);

    const billDiscount = roundMoney(payload.billDiscount || 0);

    const grandTotal = roundMoney(
      subTotal - itemDiscount - billDiscount + taxAmount,
    );

    /* ---------- PAYMENTS ---------- */
    const paidAmount = roundMoney(
      payload.payments.reduce((s, p) => s + Number(p.amount || 0), 0),
    );

    if (paidAmount > grandTotal) {
      throw new Error("Paid amount exceeds total");
    }

    const dueAmount = roundMoney(grandTotal - paidAmount);

    if (payload.type === "RETAIL" && dueAmount > 0) {
      throw new Error("RETAIL sale must be fully paid");
    }

    /* ---------- SALE ---------- */
    const { insertedId: saleId } = await db
      .collection(COLLECTIONS.SALES)
      .insertOne(
        {
          invoiceNo,
          type: payload.type,
          branchId,
          customerId: payload.customerId
            ? new ObjectId(payload.customerId)
            : null,
          salesmanId: payload.salesmanId
            ? new ObjectId(payload.salesmanId)
            : null,
          subTotal,
          itemDiscount,
          billDiscount,
          taxAmount,
          grandTotal,
          paidAmount,
          dueAmount,
          status: SALE_STATUS.COMPLETED,
          createdBy: new ObjectId(user._id),
          createdAt: new Date(),
        },
        { session },
      );

    await upsertCustomerBranch({
      db,
      customerId: payload.customerId,
      branchId,
      branchName: branch.name || "Branch not found",
      session,
    });
    await addLoyaltyPoints({
      db,
      customerId: payload.customerId,
      invoiceAmount: grandTotal,
      refType: "SALE",
      refId: saleId,
      session,
    });

    await db.collection(COLLECTIONS.SALE_ITEMS).insertMany(
      saleItems.map((i) => ({ ...i, saleId })),
      { session },
    );

    await db.collection(COLLECTIONS.SALE_PAYMENTS).insertMany(
      payload.payments.map((p) => ({
        saleId,
        method: p.method,
        paymentId: new ObjectId(p.accountId) || null,
        amount: Number(p.amount),
        reference: p.reference || null,
        receivedAt: new Date(),
      })),
      { session },
    );

    /* ---------- FIFO STOCK CONSUME ---------- */
    let totalCogs = 0;

    for (const item of payload.items) {
      const variantId = ensureObjectId(item.variantId, "variantId");
      const qty = Number(item.qty);
      const cogs = await consumeStockFIFO({
        db,
        session,
        branchId,
        variantId,
        saleQty: qty,
        saleId,
      });

      totalCogs += cogs;

      await decrementStockCache({
        db,
        session,
        branchId,
        variantId,
        qty,
      });
    }

    /* ---------- ACCOUNTING ---------- */
    await salesCogsAccounting({
      db,
      session,
      saleId,
      cogsAmount: totalCogs,
      branchId,
      narration: `COGS for ${invoiceNo}`,
    });

    await salesAccounting({
      db,
      session,
      saleId,

      grossAmount: subTotal,
      discountAmount: itemDiscount + billDiscount,
      vatAmount: taxAmount,

      payments: payload.payments,
      customerId: payload.customerId,
      branchId,
      narration: `Sale Invoice ${invoiceNo}`,
    });

    await processLoyaltyAfterSale({
      db,
      session,
      saleId,
      customerId: payload.customerId,
      branchId,
      saleAmount: grandTotal,
      saleDate: new Date(),
    });

    /* ---------- COMMISSION (EARN + ACCRUAL) ---------- */
    const netTotal = roundMoney(subTotal - itemDiscount - billDiscount);

    let commission = null;

    if (payload.salesmanId) {
      commission = await createSaleCommission({
        db,
        session,
        saleId,
        salesmanId: payload.salesmanId,
        branchId,
        netAmount: netTotal,
        saleDate: new Date(),
        narration: `Sales Commission Accrued for Invoice: ${invoiceNo}`,
      });
    }

    /* ---------- AUDIT ---------- */
    await writeAuditLog({
      db,
      session,
      userId: user._id,
      action: "SALE_CREATE",
      collection: COLLECTIONS.SALES,
      documentId: saleId,
      refType: "SALE",
      refId: saleId,
      branchId,
      payload: {
        invoiceNo,
        grandTotal,
        totalCogs,
        commission,
      },
      status: "SUCCESS",
    });

    await session.commitTransaction();

    return {
      success: true,
      message: `Sale successfully Invoice: ${invoiceNo}`,
      data: {
        sale: {
          saleId,
          invoiceNo,
          type: payload.type,
          status: SALE_STATUS.COMPLETED,
          date: new Date(),
          createdBy: user.name || "ERP SYSTEM",
        },
        branch: {
          branchId,
          code: branch.code,
          name: branch.name,
          phone: branch.phone || null,
          address: branch.address || null,
        },
        customer: payload.customerId
          ? {
              customerId: payload.customerId,
              name: customerdata.name || null,
              phone: customerdata.phone || null,
              address: customerdata.address || null,
            }
          : {
              customerId: null,
              name: "Walk-in Customer",
              phone: null,
              address: null,
            },
        items: saleItems.map((i) => ({
          sku: i.sku,
          qty: i.qty,
          unitPrice: i.salePrice,
          discount: i.discountAmount,
          vat: i.taxAmount,
          lineTotal: i.lineTotal,
        })),
        summary: {
          subTotal,
          itemDiscount,
          billDiscount,
          taxAmount,
          grandTotal,
          paidAmount,
          dueAmount,
        },
        payments: payload.payments.map((p) => ({
          method: p.method,
          amount: p.amount,
          reference: p.reference || null,
        })),
        print: {
          currency: "BDT",
          vatRate,
          footerNote: "Thank you for shopping with us!",
        },
      },
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const getSingleSale = async (req, res, next) => {
  try {
    const db = getDB();
    const saleId = new ObjectId(req.params.saleId);

    const data = await db
      .collection(COLLECTIONS.SALES)
      .aggregate([
        { $match: { _id: saleId } },

        {
          $lookup: {
            from: COLLECTIONS.SALE_ITEMS,
            localField: "_id",
            foreignField: "saleId",
            as: "items",
          },
        },

        {
          $lookup: {
            from: COLLECTIONS.CUSTOMERS,
            localField: "customerId",
            foreignField: "_id",
            as: "customer",
          },
        },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      ])
      .toArray();

    if (!data.length) throw new Error("Sale not found");

    res.json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

export const getPaymentMethods = async (req, res, next) => {
  const db = getDB();
  const { parentCode, search = "", page = 1, limit = 20 } = req.query;

  const skip = (page - 1) * Number(limit);

  /* ----------------------------------------
   * Find parent account (e.g. 1002)
   * ---------------------------------------- */
  const parent = await db.collection(COLLECTIONS.ACCOUNTS).findOne({
    code: parentCode,
    status: "ACTIVE",
  });

  if (!parent) {
    return res.json({
      success: true,
      data: [],
      pagination: { page: 1, limit, total: 0, hasMore: false },
    });
  }

  /* ----------------------------------------
   * Base match (NON-CASH)
   * ---------------------------------------- */
  const match = {
    parentId: parent._id,
    status: "ACTIVE",
  };

  if (search) {
    match.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  /* ----------------------------------------
   * CASH condition (special)
   * ---------------------------------------- */
  const cashMatch = {
    code: "1001",
    status: "ACTIVE",
    ...(search && {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ],
    }),
  };

  /* ----------------------------------------
   * Aggregation (Cash first)
   * ---------------------------------------- */
  const pipeline = [
    {
      $match: {
        $or: [cashMatch, match],
      },
    },
    {
      $addFields: {
        __order: {
          $cond: [{ $eq: ["$code", "1001"] }, 0, 1],
        },
      },
    },
    { $sort: { __order: 1, name: 1 } },
    { $skip: skip },
    { $limit: Number(limit) },
  ];

  const data = await db
    .collection(COLLECTIONS.ACCOUNTS)
    .aggregate(pipeline)
    .toArray();

  /* ----------------------------------------
   * Total count
   * ---------------------------------------- */
  const total = await db.collection(COLLECTIONS.ACCOUNTS).countDocuments({
    $or: [cashMatch, match],
  });

  res.json({
    success: true,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      hasMore: skip + data.length < total,
    },
    data,
  });
};
