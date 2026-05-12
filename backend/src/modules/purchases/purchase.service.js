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

/* ---------------------------------------
  Helpers
---------------------------------------- */
const toId = (id, label) => {
  if (!ObjectId.isValid(id)) throw new Error(`Invalid ${label}`);
  return new ObjectId(id);
};

/* ---------------------------------------
  Stock Upsert (AVG Cost Safe)
---------------------------------------- */
const resolvePrice = (item, variant) => {
  if (item.pricingMode === "GLOBAL") {
    return {
      costPrice: item.globalPrice.costPrice,
      salePrice: item.globalPrice.salePrice,
    };
  }

  return {
    costPrice: variant.costPrice,
    salePrice: variant.salePrice,
  };
};

async function upsertStock({
  db,
  session,
  branchId,
  variantId,
  productId,
  sku,
  productName,
  attributes,
  qty,
  salePrice,
  costPrice,
  searchableText,
  refType,
  refId,
}) {
  /* ======================
     1️⃣ UPDATE STOCK SNAPSHOT (OPTIONAL CACHE)
  ====================== */
  const stock = await db.collection(COLLECTIONS.STOCKS).findOneAndUpdate(
    { branchId, variantId },
    {
      $set: {
        branchId,
        variantId,
        productId,
        productName,
        attributes,
        sku,
        searchableText,
        salePrice,
        updatedAt: new Date(),
      },
      $inc: { qty },
    },
    {
      upsert: true,
      returnDocument: "after",
      session,
    },
  );

  /* ======================
     2️⃣ FIFO PURCHASE MOVEMENT (CRITICAL)
  ====================== */
  await db.collection(COLLECTIONS.STOCK_MOVEMENTS).insertOne(
    {
      branchId,
      variantId,
      productId,
      type: "PURCHASE",
      qty,
      costPrice,
      salePrice,
      balanceQty: qty,
      refType,
      refId,
      createdAt: new Date(),
    },
    { session },
  );
}

/* ---------------------------------------
  CREATE PURCHASE (NEW FLOW)
---------------------------------------- */
export const createPurchase = async ({ db, body, req }) => {
  const session = db.client.startSession();
  let purchaseNo = null;

  try {
    session.startTransaction();

    /* ======================
       BASIC CONTEXT
    ====================== */
    const payload = body;

    for (const item of payload.items) {
      if (!item.variants || !item.variants.length) {
        throw new Error("Purchase item has no variants");
      }

      for (const v of item.variants) {
        if (v.qty == null || v.qty <= 0) {
          throw new Error(
            `Invalid qty for product ${item.productId} (${v.size}-${v.color})`,
          );
        }

        if (v.costPrice == null || v.costPrice <= 0) {
          throw new Error(
            `Invalid cost price for product ${item.productId} (${v.size}-${v.color})`,
          );
        }
      }
    }

    const paidAmount = roundMoney(payload.paidAmount || 0);

    const mainBranch = await getMainBranch(db, session);
    const branchId = mainBranch._id;

    const supplierId = toId(payload.supplierId, "supplierId");

    /* ======================
       PURCHASE NO
    ====================== */
    purchaseNo = await generateCode({
      db,
      module: "PURCHASE",
      prefix: "PUR",
      scope: "YEAR",
      branch: mainBranch.code,
      session,
    });

    /* ======================
       PRELOAD PRODUCTS (NO N+1)
    ====================== */
    const productIds = payload.items.map((i) => toId(i.productId, "productId"));

    const products = await db
      .collection(COLLECTIONS.PRODUCTS)
      .aggregate(
        [
          { $match: { _id: { $in: productIds } } },
          {
            $lookup: {
              from: COLLECTIONS.CATEGORIES,
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: "$category" },
          {
            $lookup: {
              from: COLLECTIONS.CATEGORIES,
              localField: "category.parentId",
              foreignField: "_id",
              as: "parentCategory",
            },
          },
          { $unwind: "$parentCategory" },
        ],
        { session },
      )
      .toArray();

    const productMap = new Map(products.map((p) => [String(p._id), p]));

    /* ======================
       TOTALS
    ====================== */
    const purchaseItemsForDB = [];
    let totalQty = 0;
    let totalAmount = 0;
    const barcodePayload = [];
    const stockOperations = [];

    /* ======================
       ITEM LOOP
    ====================== */
    for (const item of payload.items) {
      const product = productMap.get(item.productId);
      if (!product) throw new Error("Product not found");

      const dbItem = {
        productId: product._id,
        pricingMode: item.pricingMode,
        ...(item.pricingMode === "GLOBAL" && {
          globalPrice: item.globalPrice,
        }),
        variants: [],
      };

      for (const variantInput of item.variants) {
        const { size, color, qty } = variantInput;
        if (!qty || qty <= 0) continue;

        const { costPrice, salePrice } = resolvePrice(item, variantInput);

        /* ======================
       FIND VARIANT
    ====================== */
        let variant = await db.collection(COLLECTIONS.VARIANTS).findOne(
          {
            productId: product._id,
            "attributes.size": size,
            "attributes.color": color,
            status: "active",
          },
          { session },
        );

        /* ======================
       CREATE VARIANT
    ====================== */
        if (!variant) {
          const sku = await generateVariantSKU({
            db,
            productId: product._id,
            productCode: product.productCode,
            session,
          });

          const insert = await db.collection(COLLECTIONS.VARIANTS).insertOne(
            {
              productId: product._id,
              sku,
              attributes: { size, color },
              costPrice,
              salePrice,
              priceHistory: [],
              status: "active",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            { session },
          );

          variant = {
            _id: insert.insertedId,
            sku,
            attributes: { size, color },
            costPrice,
            salePrice,
          };
        } else {
          /* ======================
         UPDATE VARIANT PRICES
      ====================== */
          const costChanged = variant.costPrice !== costPrice;
          const saleChanged = variant.salePrice !== salePrice;

          if (costChanged || saleChanged) {
            const update = {
              costPrice, // ✅ ALWAYS overwrite
              salePrice,
              updatedAt: new Date(),
            };

            const history = [];

            if (saleChanged) {
              history.push({
                oldPrice: variant.salePrice,
                newPrice: salePrice,
                source: "PURCHASE",
                refType: "PURCHASE",
                refId: purchaseNo,
                date: new Date(),
              });
            }

            await db.collection(COLLECTIONS.VARIANTS).updateOne(
              { _id: variant._id },
              {
                $set: update,
                ...(history.length && {
                  $push: { priceHistory: { $each: history } },
                }),
              },
              { session },
            );
          }
        }

        /* ======================
       STOCK UPSERT
    ====================== */
        // await upsertStock({
        //   db,
        //   session,
        //   branchId,
        //   variantId: variant._id,
        //   productId: product._id,
        //   productName: product.name,
        //   attributes: { size, color },
        //   sku: variant.sku,
        //   qty,
        //   costPrice,
        //   salePrice,
        //   searchableText: `${product.name} ${product.productCode} ${variant.sku} ${size} ${color}`,
        // });

        stockOperations.push({
          variantId: variant._id,
          productId: product._id,
          productName: product.name,
          attributes: { size, color },
          sku: variant.sku,
          qty,
          costPrice,
          salePrice,
          searchableText: `${product.name} ${product.productCode} ${variant.sku} ${size} ${color}`,
        });

        /* ======================
       BARCODE (PER UNIT)
    ====================== */
        for (let i = 0; i < qty; i++) {
          barcodePayload.push({
            productName: product.name,
            sku: variant.sku,
            parentCategory: product.parentCategory.name,
            subCategory: product.category.name,
            salesPrice: salePrice,
            attribute: { size, color },
          });
        }

        /* ======================
       PURCHASE ITEM SNAPSHOT
    ====================== */
        dbItem.variants.push({
          variantId: variant._id,
          qty,
          costPrice,
          salePrice,
        });

        totalQty += qty;
        totalAmount += qty * costPrice;
      }

      if (dbItem.variants.length) {
        purchaseItemsForDB.push(dbItem);
      }
    }

    totalAmount = roundMoney(totalAmount);
    const dueAmount = roundMoney(Math.max(totalAmount - paidAmount, 0));

    const paymentStatus =
      dueAmount === 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "DUE";

    /* ======================
       PURCHASE INSERT
    ====================== */
    const insertResult = await db.collection(COLLECTIONS.PURCHASES).insertOne(
      {
        purchaseNo,
        supplierId,
        branchId,
        invoiceNumber: payload.invoiceNumber,
        invoiceDate: payload.invoiceDate,
        items: purchaseItemsForDB,
        totalQty,
        totalAmount,
        paidAmount,
        dueAmount,
        paymentStatus,
        notes: payload.notes || null,
        createdAt: new Date(),
      },
      { session },
    );

    for (const stock of stockOperations) {
      await upsertStock({
        db,
        session,
        branchId,
        ...stock,
        refType: "PURCHASE",
        refId: insertResult.insertedId, // ✅ real reference
      });
    }

    /* ======================
       ACCOUNTING
    ====================== */
    await purchaseAccounting({
      db,
      session,
      purchaseId: insertResult.insertedId,
      totalAmount,
      cashPaid: paidAmount,
      dueAmount,
      supplierId,
      branchId,
      narration: `Purchase #${purchaseNo}`,
    });

    /* ======================
       AUDIT LOG
    ====================== */
    await writeAuditLog({
      db,
      session,
      userId: toId(req?.user?._id, "userId"),
      action: "PURCHASE_CREATE",
      collection: COLLECTIONS.PURCHASES,
      documentId: insertResult.insertedId,
      refType: "PURCHASE",
      refId: insertResult.insertedId,
      payload: {
        purchaseNo,
        totalQty,
        totalAmount,
        paidAmount,
        dueAmount,
      },
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"],
      status: "SUCCESS",
    });

    await session.commitTransaction();

    return {
      purchaseNo,
      branch: mainBranch.code,
      totalQty,
      totalAmount,
      paidAmount,
      dueAmount,
      barcodes: barcodePayload,
    };
  } catch (error) {
    await session.abortTransaction();

    await writeAuditLog({
      db,
      session,
      userId: toId(req?.user?._id, "userId"),
      action: "PURCHASE_CREATE_FAILED",
      collection: COLLECTIONS.PURCHASES,
      payload: {
        purchaseNo,
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
                $multiply: ["$items.variants.qty", "$items.variants.costPrice"],
              },
            },

            items: {
              $push: {
                variantId: "$variant._id",
                sku: "$variant.sku",
                attributes: "$variant.attributes",
                productName: "$product.name",

                qty: "$items.variants.qty",
                costPrice: "$items.variants.costPrice",
                salePrice: "$items.variants.salePrice",

                lineTotal: {
                  $multiply: [
                    "$items.variants.qty",
                    "$items.variants.costPrice",
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
    const purchase = await db.collection("purchases").findOne(
      { _id: toId(purchaseId) },
      { session }
    );

    if (!purchase) throw new Error("Purchase not found");

    if (purchase.status === "CANCELLED")
      throw new Error("Cannot pay a cancelled purchase");

    if (purchase.paymentStatus === "PAID")
      throw new Error("This purchase is already fully paid");

    if (purchase.dueAmount <= 0)
      throw new Error("No due amount remaining");

    if (numericAmount > purchase.dueAmount)
      throw new Error("Payment exceeds remaining due");

    /* =========================
       VALIDATE PAYMENT ACCOUNT
    ========================== */
    const paymentAccount = await db.collection("accounts").findOne(
      { _id: toId(paymentAccountId), status: "ACTIVE" },
      { session }
    );

    if (!paymentAccount)
      throw new Error("Invalid or inactive payment account");

    /* =========================
       SAFE RECALCULATION
    ========================== */
    const updatedPaidAmount = roundMoney(
      (purchase.paidAmount || 0) + numericAmount
    );

    const updatedDueAmount = roundMoney(
      purchase.totalAmount - updatedPaidAmount
    );

    if (updatedDueAmount < 0)
      throw new Error("Payment calculation error");

    const paymentStatus =
      updatedDueAmount === 0 ? "PAID" : "PARTIAL";

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
      { session }
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
      { session }
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
          costPrice: purchaseItem.costPrice,
          salePrice: purchaseItem.salePrice || null,

          balanceQty: newBalanceQty,

          refType: "PURCHASE_RETURN",
          refId: returnNo,

          createdAt: new Date(),
        },
        { session },
      );

      totalQty += item.qty;
      totalAmount += item.qty * purchaseItem.costPrice;
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
