import { toObjectId } from "../../utils/safeObjectId.js";
import { generateCode } from "../../utils/codeGenerator.js";

import { writeAuditLog } from "../../utils/logger.js";
import { COLLECTIONS } from "../../database/collections.js";
import { getMainBranch } from "../../utils/getMainWarehouse.js";
import {
  purchaseAccounting,
  purchaseReturnAccounting,
} from "../accounting/accounting.adapter.js";
import { roundMoney } from "../../utils/money.js";
import { formatDocuments } from "../../utils/formatedDocument.js";
import {
  buildAggregationPipeline,
  castObjectId,
} from "../../database/buildAggregationPipeline.js";
import { aggregateList } from "../../database/aggregateList.js";
import { ObjectId } from "mongodb";
import { generateVariantSKU } from "../../utils/sku/generateVariantSKU.js";
import { getDB } from "../../config/db.js";
import { ensureObjectId } from "../../utils/ensureObjectId.js";
import { resolveSystemAccounts } from "../accounting/account.resolver.js";
import { postJournalEntry } from "../accounting/journals/journals.service.js";
import { processPurchaseInvoiceAccounting } from "./purchase.accounting.js";

export const createPurchase = async (req, res, next) => {
  const db = getDB();
  const session = db.client.startSession();
  let generatedPurchaseNo = null;

  try {
    session.startTransaction();
    const payload = req.body;

    if (!payload.items || !payload.items.length) {
      throw new Error("Cannot process a purchase invoice without items.");
    }

    const supplierId = ensureObjectId({
      value: payload.supplierId,
      field: "supplierId",
    });

    const mainBranch = await getMainBranch(db, session);
    const branchId = mainBranch._id;

    const supplierDoc = await db
      .collection(COLLECTIONS.PARTIES)
      .findOne({ _id: supplierId }, { projection: { name: 1 }, session });
    if (!supplierDoc)
      throw new Error(
        "Referenced supplier entity not found in cloud registry.",
      );
    const supplierName = supplierDoc.name;

    generatedPurchaseNo = await generateCode({
      db,
      module: "PURCHASE",
      prefix: "Pur",
      scope: "YEAR",
      branch: mainBranch.code,
      session,
    });

    const variantIds = payload.items.map((item) =>
      ensureObjectId({ value: item.variantId, field: "variantId" }),
    );
    const variantsMasterList = await db
      .collection(COLLECTIONS.VARIANTS)
      .find({ _id: { $in: variantIds } }, { session })
      .toArray();

    const variantMap = new Map(
      variantsMasterList.map((v) => [v._id.toString(), v]),
    );

    const purchaseId = new ObjectId();
    let calculatedSubTotal = 0;

    const stockMovementsToInsert = [];
    const serialsToInsert = [];
    const ledgerEntries = [];

    for (const item of payload.items) {
      const variantId = ensureObjectId({
        value: item.variantId,
        field: "variantId",
      });
      const productId = ensureObjectId({
        value: item.productId,
        field: "productId",
      });

      const incomingQty = parseInt(item.qty) || 0;
      const incomingPurchasePrice = roundMoney(
        parseFloat(item.purchasePrice) || 0,
      );
      const latestSalePrice = roundMoney(parseFloat(item.salePrice) || 0);

      if (incomingQty <= 0)
        throw new Error(`Invalid quantity provided for SKU: ${item.sku}`);
      if (incomingPurchasePrice < 0)
        throw new Error(`Invalid purchase price provided for SKU: ${item.sku}`);

      calculatedSubTotal += incomingQty * incomingPurchasePrice;

      const lookupKey = item.variantId ? item.variantId.toString().trim() : "";
      const variantMaster = variantMap.get(lookupKey);

      if (!variantMaster) {
        throw new Error(
          `The product variant item (ID: ${lookupKey}) was not found in the inventory registry. Please re-select the product.`,
        );
      }

      const variantTitle = variantMaster.title;
      const variantModel = variantMaster.model || "";
      const warrantyName = variantMaster.warrantyName || "No Warranty";

      const payloadTypeName = item.productTypeName || "";
      const dbTypeName = variantMaster.productTypeName || "";
      const isSerialProduct =
        payloadTypeName.toLowerCase().includes("serial") ||
        dbTypeName.toLowerCase().includes("serial");

      const productTypeName = isSerialProduct
        ? "serial-product"
        : "non-serial-product";
      const unitName = variantMaster.unitName || "pcs";

      const costPriceChanged =
        variantMaster.purchasePrice !== incomingPurchasePrice;
      const salePriceChanged = variantMaster.salePrice !== latestSalePrice;

      if (costPriceChanged || salePriceChanged) {
        const historyPayload = {
          oldPurchasePrice: variantMaster.purchasePrice || 0,
          newPurchasePrice: incomingPurchasePrice,
          oldSalePrice: variantMaster.salePrice || 0,
          newSalePrice: latestSalePrice,
          source: "PURCHASE",
          referenceNo: generatedPurchaseNo,
          purchaseId,
          date: new Date(),
        };

        await db.collection(COLLECTIONS.VARIANTS).updateOne(
          { _id: variantId },
          {
            $set: {
              purchasePrice: incomingPurchasePrice,
              salePrice: latestSalePrice,
              updatedAt: new Date(),
            },
            $push: { priceHistory: historyPayload },
          },
          { session },
        );
      }

      const stocksSearchableText = `${variantTitle} ${variantModel} ${item.sku}`
        .replace(/\s+/g, " ")
        .trim();

      await db.collection(COLLECTIONS.STOCKS).updateOne(
        { branchId, variantId },
        {
          $set: {
            branchId,
            variantId,
            productId,
            sku: item.sku,
            productTypeName,
            salePrice: latestSalePrice,
            warrantyName,
            supplierId,
            supplierName,
            unitName,
            searchableText: stocksSearchableText,
            updatedAt: new Date(),
          },
          $inc: { qty: incomingQty },
        },
        { upsert: true, session },
      );

      stockMovementsToInsert.push({
        branchId,
        variantId,
        productId,
        type: "STOCK_IN",
        qty: incomingQty,
        balanceQty: incomingQty,
        purchasePrice: incomingPurchasePrice,
        salePrice: latestSalePrice,
        source: "Purchase",
        refType: "PURCHASES",
        refId: purchaseId,
        referenceNo: generatedPurchaseNo,
        createdAt: new Date(),
      });

      if (isSerialProduct && item.serials && item.serials.length > 0) {
        const cleanedSerials = item.serials.map((s) =>
          s.toString().trim().toUpperCase(),
        );

        const duplicateSerialCheck = await db
          .collection(COLLECTIONS.PRODUCT_SERIALS)
          .findOne(
            { serialNumber: { $in: cleanedSerials }, status: "In-Stock" },
            { session },
          );
        if (duplicateSerialCheck) {
          throw new Error(
            `Fraud Trap! Serial '${duplicateSerialCheck.serialNumber}' already exists inside In-Stock inventory.`,
          );
        }

        cleanedSerials.forEach((serialNumber) => {
          const serialSearchableText =
            `${variantTitle} ${variantModel} ${item.sku} ${serialNumber}`
              .replace(/\s+/g, " ")
              .trim();

          serialsToInsert.push({
            serialNumber,
            productId,
            variantId,
            purchaseId,
            supplierId,
            branchId,
            purchaseDate: payload.purchaseDate
              ? new Date(payload.purchaseDate)
              : new Date(),
            status: "In-Stock",
            salePrice: latestSalePrice,
            warrantyName,
            searchableText: serialSearchableText,
            salesInvoiceNo: null,
            warrantyExpiry: null,
            createdAt: new Date(),
          });
        });
      }
    }

    const shippingCost = roundMoney(parseFloat(payload.shippingCost) || 0);
    const bankCharge = roundMoney(
      parseFloat(payload.bankCharge) || 0,
    );
    console.log(payload.bankCharge)
    const grandTotal = roundMoney(
      calculatedSubTotal + shippingCost + bankCharge,
    );
    const paidAmount = roundMoney(
      parseFloat(payload.paymentInfo?.paidAmount) || 0,
    );
    const dueAmount = roundMoney(Math.max(grandTotal - paidAmount, 0));

    const paymentStatus =
      dueAmount === 0 ? "Paid" : paidAmount > 0 ? "Partial" : "Due";

    if (stockMovementsToInsert.length > 0) {
      await db
        .collection(COLLECTIONS.STOCK_MOVEMENTS)
        .insertMany(stockMovementsToInsert, { session });
    }
    if (serialsToInsert.length > 0) {
      await db
        .collection(COLLECTIONS.PRODUCT_SERIALS)
        .insertMany(serialsToInsert, { session });
    }

    await processPurchaseInvoiceAccounting({
      db,
      session,
      purchaseId: purchaseId,
      invoiceNo: payload.invoiceNo,
      calculatedSubTotal: calculatedSubTotal,
      shippingCost: shippingCost,
      bankCharge: bankCharge,
      splitPayments: payload.paymentInfo.splitPayments,
      partyId: supplierId,
      partyType: "supplier",
      branchId: payload.branchId || null,
      narration: `Procurement Tracking Invoice: ${payload.invoiceNo} (SubTotal: ${calculatedSubTotal} | Shipping: ${shippingCost} | BankCharge: ${bankCharge})`,
    });

    const purchaseMasterDocument = {
      _id: purchaseId,
      purchaseNo: generatedPurchaseNo,
      invoiceNo: payload.invoiceNo,
      subject: payload.subject || "",
      purchaseDate: payload.purchaseDate
        ? new Date(payload.purchaseDate)
        : new Date(),
      supplierId,
      branchId,
      shippingCost,
      items: payload.items.map((i) => ({
        productId: ensureObjectId({ value: i.productId, field: "productId" }),
        variantId: ensureObjectId({ value: i.variantId, field: "variantId" }),
        sku: i.sku,
        qty: parseInt(i.qty),
        purchasePrice: roundMoney(parseFloat(i.purchasePrice) || 0),
        salePrice: roundMoney(parseFloat(i.salePrice) || 0),
        serials: i.serials || [],
      })),
      paymentInfo: {
        subTotal: calculatedSubTotal,
        grandTotal,
        paidAmount,
        dueAmount,
        status: paymentStatus,
      },
      notes: payload.notes?.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db
      .collection(COLLECTIONS.PURCHASES)
      .insertOne(purchaseMasterDocument, { session });

    await writeAuditLog({
      db,
      session,
      userId: req?.user?._id
        ? ensureObjectId({ value: req.user._id, field: "userId" })
        : null,
      action: "PURCHASE_CREATE_SUCCESS",
      collection: COLLECTIONS.PURCHASES,
      documentId: purchaseId,
      payload: {
        invoiceNo: generatedPurchaseNo,
        grandTotal,
        paidAmount,
        dueAmount,
        status: paymentStatus,
      },
      status: "SUCCESS",
    });

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message:
        "Purchase executed on Main Branch with 100% price ledger history and dynamic note locking.",
      data: {
        purchaseId,
        invoiceNo: generatedPurchaseNo,
        grandTotal,
        paymentStatus,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
};

export const getAllPurchases = async (req, res, next) => {
  try {
    const db = getDB();

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 100);

    const match = {};

    if (req.query.supplierId) {
      match.supplierId = castObjectId(req.query.supplierId);
    }

    if (req.query.paymentStatus) {
      match.paymentStatus = req.query.paymentStatus;
    }

    const pipeline = buildAggregationPipeline({
      match,
      search: req.query.search,
      searchableFields: ["purchaseNo", "invoiceNumber"],
      page,
      limit,
      lookups: [
        {
          from: COLLECTIONS.PARTIES,
          localField: "supplierId",
          foreignField: "_id",
          as: "supplier",
        },
      ],
      project: {
        items: 0,
        "supplier.address": 0,
      },
    });

    const { data, total } = await aggregateList({
      db,
      collection: COLLECTIONS.PURCHASES,
      pipeline,
      match,
    });

    res.json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: formatDocuments(data),
    });
  } catch (err) {
    next(err);
  }
};

export const getSinglePurchaseInvoice = async (req, res, next) => {
  try {
    const db = getDB();
    const purchaseId = toObjectId(req.params.id, "purchaseId");

    const data = await db
      .collection(COLLECTIONS.PURCHASES)
      .aggregate([
        { $match: { _id: purchaseId } },

        /* ---------- UNWIND ---------- */
        { $unwind: "$items" },
        { $unwind: "$items.variants" },

        /* ---------- VARIANT LOOKUP ---------- */
        {
          $lookup: {
            from: COLLECTIONS.VARIANTS,
            localField: "items.variants.variantId",
            foreignField: "_id",
            as: "variant",
          },
        },
        { $unwind: "$variant" },

        /* ---------- PRODUCT LOOKUP ---------- */
        {
          $lookup: {
            from: COLLECTIONS.PRODUCTS,
            localField: "variant.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },

        /* ---------- SUPPLIER ---------- */
        {
          $lookup: {
            from: COLLECTIONS.SUPPLIERS,
            localField: "supplierId",
            foreignField: "_id",
            as: "supplier",
          },
        },
        { $unwind: "$supplier" },

        /* ---------- BRANCH ---------- */
        {
          $lookup: {
            from: COLLECTIONS.BRANCHES,
            localField: "branchId",
            foreignField: "_id",
            as: "branch",
          },
        },
        { $unwind: "$branch" },

        /* ---------- GROUP BACK ---------- */
        {
          $group: {
            _id: "$_id",

            purchaseNo: { $first: "$purchaseNo" },
            invoiceNumber: { $first: "$invoiceNumber" },
            invoiceDate: { $first: "$invoiceDate" },

            supplier: { $first: "$supplier" },
            branch: { $first: "$branch" },

            // Existing stored fields
            storedTotalQty: { $first: "$totalQty" },
            storedTotalAmount: { $first: "$totalAmount" },
            paidAmount: { $first: "$paidAmount" },
            dueAmount: { $first: "$dueAmount" },
            paymentStatus: { $first: "$paymentStatus" },

            // Calculated totals
            calculatedTotalQty: { $sum: "$items.variants.qty" },
            calculatedTotalAmount: {
              $sum: {
                $multiply: ["$items.variants.qty", "$items.variants.purchasePrice"],
              },
            },

            items: {
              $push: {
                variantId: "$variant._id",
                sku: "$variant.sku",
                attributes: "$variant.attributes",
                productName: "$product.name",

                qty: "$items.variants.qty",
                purchasePrice: "$items.variants.purchasePrice",
                salePrice: "$items.variants.salePrice",

                lineTotal: {
                  $multiply: [
                    "$items.variants.qty",
                    "$items.variants.purchasePrice",
                  ],
                },
              },
            },
          },
        },

        /* ---------- FINAL SHAPE ---------- */
        {
          $addFields: {
            totalQty: "$calculatedTotalQty",
            totalAmount: "$calculatedTotalAmount",
          },
        },

        /* ---------- CLEAN ---------- */
        {
          $project: {
            storedTotalQty: 0,
            storedTotalAmount: 0,
            calculatedTotalQty: 0,
            calculatedTotalAmount: 0,

            "supplier._id": 0,
            "supplier.status": 0,
            "supplier.createdAt": 0,
            "supplier.updatedAt": 0,

            "branch._id": 0,
            "branch.status": 0,
            "branch.createdAt": 0,
            "branch.updatedAt": 0,
          },
        },
      ])
      .toArray();

    if (!data.length) {
      return res.status(404).json({
        success: false,
        message: "Purchase invoice not found",
      });
    }

    res.json({
      success: true,
      data: formatDocuments(data)[0],
    });
  } catch (err) {
    next(err);
  }
};

export const createSupplierPayment = async ({ body, req }) => {
  const db = getDB();
  const session = db.client.startSession();

  try {
    session.startTransaction();

    const { purchaseId, amount, paymentAccountId } = body;

    if (!purchaseId) throw new Error("Purchase ID required");
    if (!paymentAccountId) throw new Error("Payment account required");

    const numericAmount = roundMoney(amount);

    if (!numericAmount || numericAmount <= 0)
      throw new Error("Invalid payment amount");

    /* =========================
       LOAD PURCHASE (LOCK SAFE)
    ========================== */
    const purchase = await db
      .collection("purchases")
      .findOne({ _id: toId(purchaseId) }, { session });

    if (!purchase) throw new Error("Purchase not found");

    if (purchase.status === "CANCELLED")
      throw new Error("Cannot pay a cancelled purchase");

    if (purchase.paymentStatus === "PAID")
      throw new Error("This purchase is already fully paid");

    if (purchase.dueAmount <= 0) throw new Error("No due amount remaining");

    if (numericAmount > purchase.dueAmount)
      throw new Error("Payment exceeds remaining due");

    /* =========================
       VALIDATE PAYMENT ACCOUNT
    ========================== */
    const paymentAccount = await db
      .collection("accounts")
      .findOne({ _id: toId(paymentAccountId), status: "ACTIVE" }, { session });

    if (!paymentAccount) throw new Error("Invalid or inactive payment account");

    /* =========================
       SAFE RECALCULATION
    ========================== */
    const updatedPaidAmount = roundMoney(
      (purchase.paidAmount || 0) + numericAmount,
    );

    const updatedDueAmount = roundMoney(
      purchase.totalAmount - updatedPaidAmount,
    );

    if (updatedDueAmount < 0) throw new Error("Payment calculation error");

    const paymentStatus = updatedDueAmount === 0 ? "PAID" : "PARTIAL";

    /* =========================
       UPDATE PURCHASE
    ========================== */
    const updateResult = await db.collection("purchases").updateOne(
      {
        _id: purchase._id,
        dueAmount: purchase.dueAmount,
      },
      {
        $set: {
          paidAmount: updatedPaidAmount,
          dueAmount: updatedDueAmount,
          paymentStatus,
          updatedAt: new Date(),
        },
        $push: {
          paymentHistory: {
            amount: numericAmount,
            paymentAccountId: paymentAccount._id,
            paymentAccountName: paymentAccount.name,
            date: new Date(),
            createdBy: toId(req.user._id),
          },
        },
      },
      { session },
    );

    if (updateResult.modifiedCount !== 1)
      throw new Error("Payment conflict detected. Try again.");

    /* =========================
       INSERT PAYMENT RECORD
    ========================== */
    await db.collection("supplier_payments").insertOne(
      {
        purchaseId: purchase._id,
        purchaseNo: purchase.purchaseNo,
        supplierId: purchase.supplierId,
        branchId: purchase.branchId,
        totalAmount: purchase.totalAmount,
        paidNow: numericAmount,
        previousPaid: purchase.paidAmount,
        remainingDue: updatedDueAmount,
        paymentAccountId: paymentAccount._id,
        referenceType: "SUPPLIER_PAYMENT",
        createdAt: new Date(),
        createdBy: toId(req.user._id),
      },
      { session },
    );

    /* =========================
       ACCOUNTING ENTRY
    ========================== */
    const SYS = await resolveSystemAccounts(db);

    await postJournalEntry({
      db,
      session,
      date: new Date(),
      refType: "SUPPLIER_PAYMENT",
      refId: purchase._id,
      narration: `Supplier Payment - ${purchase.purchaseNo}`,
      branchId: purchase.branchId,
      entries: [
        {
          accountId: SYS.SUPPLIER_AP,
          debit: numericAmount,
          partyType: "SUPPLIER",
          partyId: purchase.supplierId,
        },
        {
          accountId: paymentAccount._id,
          credit: numericAmount,
        },
      ],
    });

    /* =========================
       AUDIT LOG
    ========================== */
    await writeAuditLog({
      db,
      session,
      userId: toId(req.user._id),
      action: "SUPPLIER_PAYMENT_CREATE",
      collection: "supplier_payments",
      documentId: purchase._id,
      refType: "PURCHASE",
      refId: purchase._id,
      payload: {
        purchaseNo: purchase.purchaseNo,
        paidNow: numericAmount,
        remainingDue: updatedDueAmount,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      status: "SUCCESS",
    });

    await session.commitTransaction();

    return {
      purchaseNo: purchase.purchaseNo,
      paidNow: numericAmount,
      remainingDue: updatedDueAmount,
      paymentStatus,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
export const createPurchaseReturn = async ({ db, body, req }) => {
  const session = db.client.startSession();

  let purchase = null;
  let returnNo;
  let totalQty = 0;
  let totalAmount = 0;
  let mainBranch;

  try {
    session.startTransaction();

    /* 1️⃣ MAIN BRANCH */
    mainBranch = await getMainBranch(db, session);
    const branchId = mainBranch._id;

    /* 2️⃣ PURCHASE FETCH */
    const purchaseId = toObjectId(body.purchaseId, "purchaseId");

    purchase = await db
      .collection(COLLECTIONS.PURCHASES)
      .findOne({ _id: purchaseId }, { session });

    if (!purchase) throw new Error("Purchase not found");

    /* 3️⃣ RETURN NUMBER */
    returnNo = await generateCode({
      db,
      module: "PURCHASE_RETURN",
      prefix: "PRT",
      scope: "YEAR",
      branch: mainBranch.code,
      session,
    });

    /* 4️⃣ ITEM LOOP */
    for (const item of body.items) {
      const variantId = toObjectId(item.variantId, "variantId");

      const purchaseItem = purchase.items
        .flatMap((i) => i.variants)
        .find((v) => v.variantId.toString() === variantId.toString());

      if (!purchaseItem) {
        throw new Error("Variant not found in purchase");
      }

      if (item.qty <= 0 || item.qty > purchaseItem.qty) {
        throw new Error("Invalid return quantity");
      }

      /* ---------- STOCK CHECK ---------- */
      const stock = await db
        .collection(COLLECTIONS.STOCKS)
        .findOne({ branchId, variantId }, { session });

      if (!stock || stock.qty < item.qty) {
        throw new Error("Insufficient stock for return");
      }

      const newBalanceQty = stock.qty - item.qty;

      /* ---------- STOCK UPDATE ---------- */
      await db.collection(COLLECTIONS.STOCKS).updateOne(
        { _id: stock._id },
        {
          $inc: { qty: -item.qty },
          $set: { updatedAt: new Date() },
        },
        { session },
      );

      /* ---------- STOCK MOVEMENT (🔥 CORRECT PLACE) ---------- */
      await db.collection(COLLECTIONS.STOCK_MOVEMENTS).insertOne(
        {
          branchId,
          variantId,
          productId: stock.productId,

          type: "PURCHASE_RETURN",
          qty: -item.qty,
          purchasePrice: purchaseItem.purchasePrice,
          salePrice: purchaseItem.salePrice || null,

          balanceQty: newBalanceQty,

          refType: "PURCHASE_RETURN",
          refId: returnNo,

          createdAt: new Date(),
        },
        { session },
      );

      totalQty += item.qty;
      totalAmount += item.qty * purchaseItem.purchasePrice;
    }

    totalAmount = roundMoney(totalAmount);

    /* 5️⃣ PURCHASE RETURN INSERT */
    const insertResult = await db
      .collection(COLLECTIONS.PURCHASE_RETURNS)
      .insertOne(
        {
          returnNo,
          purchaseId,
          supplierId: purchase.supplierId,
          branchId,
          returnDate: body.returnDate || new Date(),
          reason: body.reason || null,
          items: body.items,
          totalQty,
          totalAmount,
          createdAt: new Date(),
        },
        { session },
      );

    /* 6️⃣ PURCHASE BALANCE UPDATE */
    const newTotalAmount = roundMoney(
      Math.max(purchase.totalAmount - totalAmount, 0),
    );

    const newDueAmount = roundMoney(
      Math.max(newTotalAmount - purchase.paidAmount, 0),
    );

    const newPaymentStatus =
      newDueAmount === 0 ? "PAID" : purchase.paidAmount > 0 ? "PARTIAL" : "DUE";

    await db.collection(COLLECTIONS.PURCHASES).updateOne(
      { _id: purchaseId },
      {
        $set: {
          totalAmount: newTotalAmount,
          dueAmount: newDueAmount,
          paymentStatus: newPaymentStatus,
          updatedAt: new Date(),
        },
      },
      { session },
    );

    /* 7️⃣ ACCOUNTING */
    await purchaseReturnAccounting({
      db,
      session,
      purchaseReturnId: insertResult.insertedId,
      returnAmount: totalAmount,
      cashRefund: Number(body.cashRefund || 0),
      dueAdjust: Number(body.dueAdjust || 0),
      supplierId: purchase.supplierId,
      branchId,
      narration: `Purchase Return #${returnNo}`,
    });

    /* 8️⃣ AUDIT LOG */
    await writeAuditLog({
      db,
      session,
      userId: toObjectId(req?.user?._id),
      action: "PURCHASE_RETURN_CREATE",
      collection: COLLECTIONS.PURCHASE_RETURNS,
      documentId: insertResult.insertedId,
      refType: "PURCHASE_RETURN",
      refId: purchase._id,
      branchId,
      payload: {
        returnNo,
        purchaseId,
        supplierId: purchase.supplierId,
        totalQty,
        totalAmount,
      },
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"],
    });

    await session.commitTransaction();

    return {
      returnNo,
      purchaseId,
      totalQty,
      totalAmount,
      branch: mainBranch.code,
    };
  } catch (error) {
    await session.abortTransaction();

    await writeAuditLog({
      db,
      session,
      userId: toObjectId(req?.user?._id),
      action: "PURCHASE_RETURN_FAILED",
      collection: COLLECTIONS.PURCHASE_RETURNS,
      refType: "PURCHASE_RETURN",
      refId: purchase ? purchase._id : null,
      payload: {
        returnNo: returnNo || null,
        error: error.message,
      },
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"],
      status: "FAILED",
    });

    throw error;
  } finally {
    await session.endSession();
  }
};

export const getAllPurchaseReturns = async (req, res, next) => {
  try {
    const db = getDB();

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 100);

    const match = {};

    if (req.query.supplierId) {
      match.supplierId = castObjectId(req.query.supplierId);
    }

    if (req.query.purchaseId) {
      match.purchaseId = castObjectId(req.query.purchaseId);
    }

    const pipeline = buildAggregationPipeline({
      match,
      search: req.query.search,
      searchableFields: ["returnNo"],
      page,
      limit,
      lookups: [
        {
          from: COLLECTIONS.PURCHASES,
          localField: "purchaseId",
          foreignField: "_id",
          as: "purchase",
        },
        {
          from: COLLECTIONS.SUPPLIERS,
          localField: "supplierId",
          foreignField: "_id",
          as: "supplier",
        },
      ],
      project: {
        items: 0,
        "supplier.address": 0,
      },
    });

    const { data, total } = await aggregateList({
      db,
      collection: COLLECTIONS.PURCHASE_RETURNS,
      pipeline,
      match,
    });

    res.json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: formatDocuments(data),
    });
  } catch (err) {
    next(err);
  }
};

export const getSinglePurchaseReturnInvoice = async (req, res, next) => {
  try {
    const db = getDB();

    const returnId = toObjectId(req.params.id, "returnId");

    const data = await db
      .collection(COLLECTIONS.PURCHASE_RETURNS)
      .aggregate([
        { $match: { _id: returnId } },

        /* ---------- PURCHASE ---------- */
        {
          $lookup: {
            from: COLLECTIONS.PURCHASES,
            localField: "purchaseId",
            foreignField: "_id",
            as: "purchase",
          },
        },
        { $unwind: "$purchase" },

        /* ---------- SUPPLIER ---------- */
        {
          $lookup: {
            from: COLLECTIONS.SUPPLIERS,
            localField: "supplierId",
            foreignField: "_id",
            as: "supplier",
          },
        },
        { $unwind: "$supplier" },

        /* ---------- BRANCH ---------- */
        {
          $lookup: {
            from: COLLECTIONS.BRANCHES,
            localField: "branchId",
            foreignField: "_id",
            as: "branch",
          },
        },
        { $unwind: "$branch" },

        /* ---------- VARIANTS ---------- */
        {
          $lookup: {
            from: COLLECTIONS.VARIANTS,
            localField: "items.variantId",
            foreignField: "_id",
            as: "variantDocs",
          },
        },

        /* ---------- MERGE ITEMS ---------- */
        {
          $addFields: {
            items: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  $mergeObjects: [
                    "$$item",
                    {
                      variant: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$variantDocs",
                              as: "v",
                              cond: {
                                $eq: ["$$v._id", "$$item.variantId"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },

        {
          $project: {
            variantDocs: 0,
          },
        },
      ])
      .toArray();

    if (!data.length) {
      return res.status(404).json({
        success: false,
        message: "Purchase return not found",
      });
    }

    res.json({
      success: true,
      data: formatDocuments(data[0]),
    });
  } catch (err) {
    next(err);
  }
};
