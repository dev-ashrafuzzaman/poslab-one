import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../database/collections.js";
import { formatDocuments } from "../../utils/formatedDocument.js";
import { ensureObjectId } from "../../utils/ensureObjectId.js";
import { getDB } from "../../config/db.js";
import { getBusinessDateBD } from "../../utils/businessDate.js";
import { calculateDiscount, getBDMidnight } from "./discount/discount.utils.js";
import {
  getActiveDiscountsForPOS,
  getActiveProductDiscounts,
} from "./discount/discount.service.js";
import { generateCode } from "../../utils/codeGenerator.js";
import { getMainWarehouse } from "../branches/branch.utils.js";
import { upsertStock } from "./stock.utils.js";
import { recordStockMovement } from "./stockMovement.utils.js";
import { STOCK_MOVEMENT_TYPES } from "../../config/constants/stockMovementTypes.js";
import { buildStockReport } from "./stockReport.service.js";
import { consumeStockFIFOWithLayers } from "./consumeStockFIFO.js";
import { decrementStockCache } from "./decrementStockCache.js";

/* ======================================================
   Helpers
====================================================== */
const toObjectId = (value, label) => {
  if (!value) throw new Error(`${label} is required`);
  if (value instanceof ObjectId) return value;
  if (!ObjectId.isValid(value)) {
    throw new Error(`${label} must be a valid ObjectId`);
  }
  return new ObjectId(value);
};

const resolveVariantId = (item) => {
  if (item.variantId) return toObjectId(item.variantId, "variantId");
  if (item.variant?._id) return toObjectId(item.variant._id, "variant._id");
  throw new Error("Variant ID missing in transfer item");
};

export const generateStockReport = async (req, res) => {
  try {
    const report = await buildStockReport({
      user: req.user,
      filters: req.body,
    });

    res.json({
      success: true,
      rows: report,
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message || "Report generation failed",
    });
  }
};

export const getAllStocks = async (req, res, next) => {
  try {
    const db = getDB();

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    /* ---------------------------
       Base match (FAST FILTER)
    ---------------------------- */
    const match = {};

    if (req.query.branchId && ObjectId.isValid(req.query.branchId)) {
      match.branchId = new ObjectId(req.query.branchId);
    }

    if (req.query.minQty) {
      match.qty = { $lte: Number(req.query.minQty) };
    }

    if (req.query.supplierId && ObjectId.isValid(req.query.supplierId)) {
      match.lastSupplierId = new ObjectId(req.query.supplierId);
    }

    const search = req.query.search?.trim();

    /* ---------------------------
       Aggregation Pipeline
    ---------------------------- */
    const pipeline = [
      { $match: match },

      /* ---------- Supplier ---------- */
      {
        $lookup: {
          from: COLLECTIONS.SUPPLIERS,
          localField: "lastSupplierId",
          foreignField: "_id",
          as: "supplier",
        },
      },
      {
        $unwind: {
          path: "$supplier",
          preserveNullAndEmptyArrays: true,
        },
      },

      /* ---------- Branch ---------- */
      {
        $lookup: {
          from: COLLECTIONS.BRANCHES,
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: "$branch" },

      /* ---------- Variant ---------- */
      {
        $lookup: {
          from: COLLECTIONS.VARIANTS,
          localField: "variantId",
          foreignField: "_id",
          as: "variant",
        },
      },
      { $unwind: "$variant" },

      /* ---------- Attribute Filters ---------- */
      ...(req.query.size
        ? [{ $match: { "variant.attributes.size": req.query.size } }]
        : []),

      ...(req.query.color
        ? [{ $match: { "variant.attributes.color": req.query.color } }]
        : []),

      /* ---------- Product ---------- */
      {
        $lookup: {
          from: COLLECTIONS.PRODUCTS,
          localField: "variant.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      /* ---------- Search ---------- */
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { sku: { $regex: search, $options: "i" } },
                  { "product.name": { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),

      /* ---------- Computed ---------- */
      {
        $addFields: {
          stockValue: { $multiply: ["$qty", "$avgCost"] },
        },
      },

      /* ---------- Projection ---------- */
      {
        $project: {
          branchId: 1,
          branchName: "$branch.name",
          branchCode: "$branch.code",

          sku: 1,
          qty: 1,
          avgCost: 1,
          stockValue: 1,
          updatedAt: 1,

          salePrice: "$variant.salePrice",
          size: "$variant.attributes.size",
          color: "$variant.attributes.color",

          productName: "$product.name",
          productSku: "$product.sku",
          brand: "$product.brand",

          supplierName: "$supplier.name",
          supplierPhone: "$supplier.contact.phone",
        },
      },

      { $sort: { updatedAt: -1 } },

      /* ---------- Pagination ---------- */
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await db
      .collection(COLLECTIONS.STOCKS)
      .aggregate(pipeline)
      .toArray();

    const data = result[0]?.data || [];
    const total = result[0]?.total?.[0]?.count || 0;

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

const isNumeric = (val) => /^[0-9]+$/.test(val);

export const getPosItems = async (req, res, next) => {
  try {
    const db = getDB();
    const { search = "", limit = 20, lastSku, lastId } = req.query;

    /* ===============================
       RESOLVE BRANCH
    =============================== */
    let branchId = req.user?.branchId;

    if (!branchId && req.user?.isSuperAdmin) {
      const main = await db
        .collection(COLLECTIONS.BRANCHES)
        .findOne({ isMain: true }, { projection: { _id: 1 } });

      if (!main) {
        return res.status(400).json({
          success: false,
          message: "Main branch not found",
        });
      }

      branchId = main._id;
    }

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "Branch unresolved",
      });
    }

    /* ===============================
       STOCK QUERY
    =============================== */
    const match = {
      branchId: new ObjectId(branchId),
      qty: { $gt: 0 },
    };

    if (search) {
      if (!isNaN(search) && search.length >= 6) {
        match.sku = search;
      } else {
        match.$text = { $search: search };
      }
    }

    if (lastSku && lastId) {
      match.$or = [
        { sku: { $gt: lastSku } },
        {
          sku: lastSku,
          _id: { $gt: new ObjectId(lastId) },
        },
      ];
    }

    /* ===============================
       FETCH STOCKS
    =============================== */
    const items = await db
      .collection(COLLECTIONS.STOCKS)
      .find(match)
      .sort({ sku: 1, _id: 1 })
      .limit(Number(limit))
      .project({
        productId: 1,
        variantId: 1,
        sku: 1,
        productName: 1,
        salePrice: 1,
        qty: 1,
        unit: 1,
      })
      .toArray();

    if (!items.length) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          limit: Number(limit),
          hasMore: false,
          lastSku: null,
          lastId: null,
        },
      });
    }

    /* ===============================
       FETCH PRODUCTS (categoryPath only)
    =============================== */
    const productIds = [
      ...new Set(items.map((i) => i.productId.toString())),
    ].map((id) => new ObjectId(id));

    const products = await db
      .collection(COLLECTIONS.PRODUCTS)
      .find({ _id: { $in: productIds } })
      .project({ categoryPath: 1 })
      .toArray();

    const productMap = new Map();
    const categorySet = new Set();

    for (const p of products) {
      productMap.set(p._id.toString(), p);
      p.categoryPath?.forEach((catId) => categorySet.add(catId.toString()));
    }

    const categoryIds = [...categorySet].map((id) => new ObjectId(id));

    /* ===============================
       FETCH ALL ACTIVE DISCOUNTS
    =============================== */
    const discounts = await getActiveDiscountsForPOS({
      db,
      branchId,
      productIds,
      categoryIds,
    });

    /* ===============================
       BUILD DISCOUNT MAPS
    =============================== */
    const productDiscountMap = new Map();
    const categoryDiscountMap = new Map();
    let branchDiscount = null;

    for (const d of discounts) {
      if (d.targetType === "PRODUCT") {
        productDiscountMap.set(d.targetId.toString(), d);
      }

      if (d.targetType === "CATEGORY") {
        categoryDiscountMap.set(d.targetId.toString(), d);
      }

      if (d.targetType === "BRANCH") {
        branchDiscount = d;
      }
    }

    /* ===============================
       APPLY PRIORITY ENGINE
       PRODUCT > CATEGORY > BRANCH
    =============================== */
    const data = items.map((item) => {
      const productId = item.productId.toString();
      const product = productMap.get(productId);

      let discount = null;

      // 1️⃣ PRODUCT
      if (productDiscountMap.has(productId)) {
        discount = productDiscountMap.get(productId);
      }

      // 2️⃣ CATEGORY (L1 + L2 supported)
      else if (product?.categoryPath?.length) {
        for (const catId of product.categoryPath) {
          if (categoryDiscountMap.has(catId.toString())) {
            discount = categoryDiscountMap.get(catId.toString());
            break;
          }
        }
      }

      // 3️⃣ BRANCH
      if (!discount && branchDiscount) {
        discount = branchDiscount;
      }

      if (!discount) {
        return {
          ...item,
          discountType: null,
          discountValue: 0,
          discountAmount: 0,
          finalPrice: item.salePrice,
        };
      }

      const { discountAmount, finalPrice } = calculateDiscount({
        salePrice: item.salePrice,
        type: discount.type,
        value: Number(discount.value),
      });
      console.log("disc", discount);
      return {
        ...item,
        discountType: discount.type,
        discountSource: discount.targetType,
        discountId: discount._id,
        discountValue: discount.value,
        discountAmount,
        finalPrice,
      };
    });

    const last = data[data.length - 1];

    /* ===============================
       RESPONSE
    =============================== */
    res.json({
      success: true,
      data,
      pagination: {
        limit: Number(limit),
        hasMore: items.length === Number(limit),
        lastSku: last?.sku || null,
        lastId: last?._id || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getTransferItems = async (req, res, next) => {
  try {
    const db = getDB();

    const {
      fromBranchId,
      search = "",
      limit = 20,
      lastSku,
      lastId,
    } = req.query;

    /* ---------------- Validate Branch ---------------- */
    if (!fromBranchId || !ObjectId.isValid(fromBranchId)) {
      return res.status(400).json({
        success: false,
        message: "Source branch is required for stock transfer",
      });
    }

    const branchId = new ObjectId(fromBranchId);

    /* ---------------- Match (STRICT) ---------------- */
    const match = {
      branchId,
      qty: { $gt: 0 },
    };

    /* ---------------- Search Strategy ---------------- */
    if (search) {
      // Barcode / SKU scan
      if (isNumeric(search) && search.length >= 6) {
        match.sku = search;
      }
      // Typing search (TEXT INDEX)
      else {
        match.$text = { $search: search };
      }
    }

    /* ---------------- Cursor Pagination ---------------- */
    if (lastSku && lastId && ObjectId.isValid(lastId)) {
      match.$or = [
        { sku: { $gt: lastSku } },
        {
          sku: lastSku,
          _id: { $gt: new ObjectId(lastId) },
        },
      ];
    }

    /* ---------------- Query ---------------- */
    const data = await db
      .collection(COLLECTIONS.STOCKS)
      .find(match)
      .sort({ sku: 1, _id: 1 })
      .limit(Number(limit))
      .project({
        _id: 1,
        productId: 1,
        variantId: 1,
        sku: 1,
        productName: 1,
        attributes: 1,
        qty: 1,
        unit: 1,
      })
      .toArray();

    const last = data[data.length - 1];

    res.json({
      success: true,
      data,
      pagination: {
        limit: Number(limit),
        hasMore: data.length === Number(limit),
        lastSku: last?.sku || null,
        lastId: last?._id || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getLowStock = async (req, res, next) => {
  try {
    const db = getDB();

    const page = Math.max(+req.query.page || 1, 1);
    const limit = Math.min(+req.query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const match = {};

    if (req.query.branchId) {
      match.branchId = new ObjectId(req.query.branchId);
    }

    const pipeline = [
      /* ---------- Base ---------- */
      { $match: match },

      /* ---------- Branch ---------- */
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: "$branch" },

      /* ---------- Variant ---------- */
      {
        $lookup: {
          from: "product_variants",
          localField: "variantId",
          foreignField: "_id",
          as: "variant",
        },
      },
      { $unwind: "$variant" },

      /* ---------- Product ---------- */
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      /* ---------- Low Stock Logic ---------- */
      {
        $addFields: {
          reorderLevel: {
            $ifNull: ["$product.reorderLevel", 3],
          },
        },
      },
      {
        $match: {
          $expr: { $lte: ["$qty", "$reorderLevel"] },
        },
      },

      /* ---------- Projection ---------- */
      {
        $project: {
          branchName: "$branch.name",
          branchCode: "$branch.code",

          productName: "$product.name",
          brand: "$product.brand",

          sku: "$variant.sku",
          size: "$variant.attributes.size",
          color: "$variant.attributes.color",

          qty: 1,
          salePrice: "$variant.salePrice",
          reorderLevel: 1,

          updatedAt: 1,
        },
      },

      { $sort: { qty: 1 } },

      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ];

    const [result] = await db
      .collection("stocks")
      .aggregate(pipeline)
      .toArray();

    res.json({
      success: true,
      pagination: {
        total: result.total[0]?.count || 0,
        page,
        limit,
      },
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

export const createStockTransfer = async (req, res, next) => {
  const session = getDB().client.startSession();

  try {
    const db = getDB();
    const { fromBranchId, toBranchId, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Transfer items required");
    }

    if (fromBranchId === toBranchId) {
      throw new Error("Source & destination cannot be same");
    }

    // 🔒 Validate duplicates
    const seen = new Set();
    for (const item of items) {
      if (!item.variantId) throw new Error("Variant missing");
      if (!Number.isInteger(Number(item.qty)) || Number(item.qty) <= 0) {
        throw new Error("Invalid quantity");
      }

      const key = item.variantId.toString();
      if (seen.has(key)) {
        throw new Error("Duplicate variant in transfer");
      }
      seen.add(key);
    }

    session.startTransaction();

    const transferNo = await generateCode({
      db,
      session,
      module: "STOCK_TRANSFER",
      prefix: "ST",
      scope: "YEAR",
    });

    const transferDoc = {
      transferNo,
      fromBranchId: new ObjectId(fromBranchId),
      toBranchId: new ObjectId(toBranchId),
      status: "PENDING",
      totalItems: items.length,
      createdBy: new ObjectId(req.user._id),
      createdAt: new Date(),
    };

    const { insertedId: transferId } = await db
      .collection("stock_transfers")
      .insertOne(transferDoc, { session });

    const transferItemDocs = [];
    const snapshotBulk = [];
    const movementBulk = [];

    for (const item of items) {
      const variantId = new ObjectId(item.variantId);
      const qty = Number(item.qty);

      // 1️⃣ FIFO consume
      const transferLayers = await consumeStockFIFOWithLayers({
        db,
        session,
        branchId: new ObjectId(fromBranchId),
        variantId,
        qty,
      });

      // 2️⃣ Prepare transfer item
      transferItemDocs.push({
        transferId,
        variantId,
        sentQty: qty,
        receivedQty: 0,
        layers: transferLayers,
        status: "PENDING",
        createdAt: new Date(),
      });

      // 3️⃣ Snapshot decrement (NO $gte check)
      snapshotBulk.push({
        updateOne: {
          filter: {
            branchId: new ObjectId(fromBranchId),
            variantId,
          },
          update: {
            $inc: { qty: -qty },
            $set: { updatedAt: new Date() },
          },
        },
      });

      // 4️⃣ Movement audit
      movementBulk.push({
        insertOne: {
          document: {
            branchId: new ObjectId(fromBranchId),
            variantId,
            type: "TRANSFER_OUT",
            qty: -qty,
            refType: "STOCK_TRANSFER",
            refId: transferId,
            createdAt: new Date(),
          },
        },
      });
    }

    // 🔥 Bulk insert transfer items
    if (transferItemDocs.length) {
      await db
        .collection("stock_transfer_items")
        .insertMany(transferItemDocs, { session });
    }

    // 🔥 Bulk snapshot update
    if (snapshotBulk.length) {
      await db
        .collection(COLLECTIONS.STOCKS)
        .bulkWrite(snapshotBulk, { session });
    }

    // 🔥 Bulk movement insert
    if (movementBulk.length) {
      await db
        .collection(COLLECTIONS.STOCK_MOVEMENTS)
        .bulkWrite(movementBulk, { session });
    }

    // Log
    await db.collection("stock_transfer_logs").insertOne(
      {
        transferId,
        action: "CREATED",
        userId: new ObjectId(req.user._id),
        createdAt: new Date(),
      },
      { session },
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Stock transfer created successfully",
      transferNo,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    await session.endSession();
  }
};

/* ======================================================
   RECEIVE STOCK TRANSFER
====================================================== */

export const receiveStockTransfer = async (req, res, next) => {
  const session = getDB().client.startSession();

  try {
    const db = getDB();
    const transferId = toObjectId(req.params.id, "transferId");
    const items = Array.isArray(req.body.items) ? req.body.items : [];

    if (!items.length) {
      throw new Error("No items provided for receiving");
    }

    session.startTransaction();

    /* ===============================
       LOAD TRANSFER
    =============================== */
    const transfer = await db
      .collection("stock_transfers")
      .findOne({ _id: transferId }, { session });

    if (!transfer) throw new Error("Transfer not found");
    if (transfer.status !== "PENDING") {
      throw new Error("Transfer already processed");
    }

    const fromBranchId = toObjectId(transfer.fromBranchId);
    const toBranchId = toObjectId(transfer.toBranchId);

    /* ===============================
       PRELOAD SOURCE SNAPSHOTS (PERFORMANCE SAFE)
    =============================== */
    const transferItems = await db
      .collection("stock_transfer_items")
      .find({ transferId })
      .toArray();

    const variantIds = transferItems.map((t) =>
      toObjectId(t.variantId, "variantId"),
    );
    const sourceSnapshots = await db
      .collection(COLLECTIONS.STOCKS)
      .find(
        {
          branchId: fromBranchId,
          variantId: { $in: variantIds },
        },
        { session },
      )
      .toArray();

    const snapshotMap = new Map(
      sourceSnapshots.map((s) => [s.variantId.toString(), s]),
    );

    let hasMismatch = false;

    const purchaseBulk = [];
    const snapshotBulk = [];
    const movementBulk = [];
    const restoreBulk = [];
    const mismatchDocs = [];

    /* ===============================
       PROCESS EACH ITEM
    =============================== */
    for (const item of items) {
      const transferItemId = toObjectId(item._id);
      const receivedQty = Number(item.receivedQty || 0);

      const transferItem = await db
        .collection("stock_transfer_items")
        .findOne({ _id: transferItemId }, { session });

      if (!transferItem) throw new Error("Transfer item not found");

      const { variantId, sentQty, layers } = transferItem;

      if (receivedQty < 0 || receivedQty > sentQty) {
        throw new Error("Invalid received quantity");
      }

      const mismatchQty = sentQty - receivedQty;
      if (mismatchQty > 0) hasMismatch = true;

      const sourceSnapshot = snapshotMap.get(variantId.toString());
      if (!sourceSnapshot) {
        throw new Error("Source stock snapshot not found");
      }

      /* =========================================
         1️⃣ FIFO RECREATE (DESTINATION)
      ========================================= */
      if (receivedQty > 0) {
        let remaining = receivedQty;

        for (const layer of layers) {
          if (remaining <= 0) break;

          const portionQty = Math.min(layer.qty, remaining);

          // Recreate FIFO purchase layer
          purchaseBulk.push({
            insertOne: {
              document: {
                branchId: toBranchId,
                variantId,
                type: "PURCHASE",
                qty: portionQty,
                costPrice: layer.costPrice,
                balanceQty: portionQty,
                refType: "STOCK_TRANSFER",
                refId: transferId,
                createdAt: new Date(),
              },
            },
          });

          // Snapshot rebuild (copy metadata from source)
          snapshotBulk.push({
            updateOne: {
              filter: { branchId: toBranchId, variantId },
              update: {
                $inc: { qty: portionQty },
                $setOnInsert: {
                  branchId: toBranchId,
                  variantId,
                  productId: sourceSnapshot.productId,
                  productName: sourceSnapshot.productName,
                  sku: sourceSnapshot.sku,
                  attributes: sourceSnapshot.attributes,
                  searchableText: sourceSnapshot.searchableText,
                  salePrice: sourceSnapshot.salePrice,
                  createdAt: new Date(),
                },
                $set: { updatedAt: new Date() },
              },
              upsert: true,
            },
          });

          movementBulk.push({
            insertOne: {
              document: {
                branchId: toBranchId,
                variantId,
                type: "TRANSFER_IN",
                qty: portionQty,
                refType: "STOCK_TRANSFER",
                refId: transferId,
                createdAt: new Date(),
              },
            },
          });

          remaining -= portionQty;
        }
      }

      /* =========================================
         2️⃣ RESTORE SOURCE IF MISMATCH
      ========================================= */
      if (mismatchQty > 0) {
        for (const layer of layers) {
          restoreBulk.push({
            updateOne: {
              filter: { _id: layer.purchaseLayerId },
              update: { $inc: { balanceQty: layer.qty } },
            },
          });
        }

        snapshotBulk.push({
          updateOne: {
            filter: { branchId: fromBranchId, variantId },
            update: {
              $inc: { qty: mismatchQty },
              $set: { updatedAt: new Date() },
            },
          },
        });

        mismatchDocs.push({
          transferId,
          transferItemId,
          variantId,
          sentQty,
          receivedQty,
          mismatchQty,
          createdAt: new Date(),
        });
      }

      await db.collection("stock_transfer_items").updateOne(
        { _id: transferItemId },
        {
          $set: {
            receivedQty,
            mismatchQty,
            status: mismatchQty === 0 ? "RECEIVED" : "MISMATCH",
          },
        },
        { session },
      );
    }

    /* ===============================
       BULK EXECUTION
    =============================== */

    if (purchaseBulk.length)
      await db
        .collection(COLLECTIONS.STOCK_MOVEMENTS)
        .bulkWrite(purchaseBulk, { session });

    if (restoreBulk.length)
      await db
        .collection(COLLECTIONS.STOCK_MOVEMENTS)
        .bulkWrite(restoreBulk, { session });

    if (snapshotBulk.length)
      await db
        .collection(COLLECTIONS.STOCKS)
        .bulkWrite(snapshotBulk, { session });

    if (movementBulk.length)
      await db
        .collection(COLLECTIONS.STOCK_MOVEMENTS)
        .bulkWrite(movementBulk, { session });

    if (mismatchDocs.length)
      await db
        .collection("stock_mismatches")
        .insertMany(mismatchDocs, { session });

    await db.collection("stock_transfers").updateOne(
      { _id: transferId },
      {
        $set: {
          status: hasMismatch ? "MISMATCH" : "RECEIVED",
          receivedAt: new Date(),
          receivedBy: new ObjectId(req.user._id),
        },
      },
      { session },
    );

    // Log
    await db.collection("stock_transfer_logs").insertOne(
      {
        transferId,
        status: hasMismatch ? "MISMATCH" : "RECEIVED",
        action: "RECEIVED",
        receivedBy: new ObjectId(req.user._id),
        receivedAt: new Date(),
      },
      { session },
    );

    await session.commitTransaction();

    res.json({
      success: true,
      status: hasMismatch ? "MISMATCH" : "RECEIVED",
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    await session.endSession();
  }
};

export const listTransfersService = async ({ user, query }) => {
  const db = getDB();

  const { status, fromBranchId, toBranchId, limit = 20, page = 1 } = query;

  /* ===============================
     MATCH BUILDER (QUERY DRIVEN)
  =============================== */
  const match = {};

  /* ---------- Status ---------- */
  if (status) {
    match.status = status;
  }

  /* ---------- Explicit Branch Filters (Highest Priority) ---------- */
  if (fromBranchId && ObjectId.isValid(fromBranchId)) {
    match.fromBranchId = new ObjectId(fromBranchId);
  }

  if (toBranchId && ObjectId.isValid(toBranchId)) {
    match.toBranchId = new ObjectId(toBranchId);
  }

  /* ---------- Default User Scope ---------- */
  if (
    !fromBranchId &&
    !toBranchId &&
    user?.branchId &&
    ObjectId.isValid(user.branchId)
  ) {
    // POS / Branch user → incoming transfers only
    match.toBranchId = new ObjectId(user.branchId);
  }

  /* ===============================
     AGGREGATION PIPELINE
  =============================== */
  const pipeline = [
    { $match: match },

    {
      $lookup: {
        from: "branches",
        localField: "fromBranchId",
        foreignField: "_id",
        as: "fromBranch",
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "toBranchId",
        foreignField: "_id",
        as: "toBranch",
      },
    },

    { $unwind: "$fromBranch" },
    { $unwind: "$toBranch" },

    {
      $project: {
        _id: 1,
        transferNo: 1,
        status: 1,
        totalItems: 1,
        createdAt: 1,

        fromBranchId: 1,
        toBranchId: 1,

        fromBranchName: "$fromBranch.name",
        toBranchName: "$toBranch.name",
      },
    },

    { $sort: { createdAt: -1 } },

    { $skip: (Number(page) - 1) * Number(limit) },
    { $limit: Number(limit) },
  ];

  const data = await db
    .collection("stock_transfers")
    .aggregate(pipeline)
    .toArray();

  /* ===============================
     RESPONSE (getTransferItems STYLE)
  =============================== */
  return {
    success: true,
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      hasMore: data.length === Number(limit),
    },
  };
};
/* ===============================
   TRANSFER DETAILS (RECEIVE PAGE)
=============================== */
export const getTransferDetailsService = async ({ user, transferId }) => {
  const db = getDB();

  if (!ObjectId.isValid(transferId)) {
    throw new Error("Invalid transfer id");
  }

  const [transfer] = await db
    .collection("stock_transfers")
    .aggregate([
      /* ================= TRANSFER ================= */
      {
        $match: { _id: new ObjectId(transferId) },
      },

      /* ================= BRANCHES ================= */
      {
        $lookup: {
          from: "branches",
          localField: "fromBranchId",
          foreignField: "_id",
          as: "fromBranch",
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "toBranchId",
          foreignField: "_id",
          as: "toBranch",
        },
      },
      { $unwind: "$fromBranch" },
      { $unwind: "$toBranch" },

      /* ================= ITEMS ================= */
      {
        $lookup: {
          from: "stock_transfer_items",
          localField: "_id",
          foreignField: "transferId",
          as: "items",
        },
      },

      /* ================= VARIANTS ================= */
      {
        $lookup: {
          from: "product_variants",
          localField: "items.variantId",
          foreignField: "_id",
          as: "variants",
        },
      },

      /* ================= PRODUCTS ================= */
      {
        $lookup: {
          from: "products",
          localField: "variants.productId",
          foreignField: "_id",
          as: "products",
        },
      },

      /* ================= MERGE ITEMS ================= */
      {
        $addFields: {
          items: {
            $map: {
              input: "$items",
              as: "it",
              in: {
                _id: "$$it._id",
                sentQty: "$$it.sentQty",
                receivedQty: "$$it.receivedQty",
                status: "$$it.status",

                variant: {
                  $let: {
                    vars: {
                      v: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$variants",
                              as: "v",
                              cond: {
                                $eq: ["$$v._id", "$$it.variantId"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      _id: "$$v._id",
                      sku: "$$v.sku",
                      attributes: "$$v.attributes",
                      productId: "$$v.productId",
                    },
                  },
                },

                productName: {
                  $let: {
                    vars: {
                      p: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$products",
                              as: "p",
                              cond: {
                                $eq: ["$$p._id", "$$it.productId"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: "$$p.name",
                  },
                },
              },
            },
          },
        },
      },

      /* ================= CLEAN OUTPUT ================= */
      {
        $project: {
          _id: 1,
          transferNo: 1,
          status: 1,
          totalItems: 1,
          createdAt: 1,

          fromBranch: {
            _id: "$fromBranch._id",
            name: "$fromBranch.name",
            code: "$fromBranch.code",
          },
          toBranch: {
            _id: "$toBranch._id",
            name: "$toBranch.name",
            code: "$toBranch.code",
          },

          items: 1,
        },
      },
    ])
    .toArray();

  if (!transfer) {
    throw new Error("Transfer not found");
  }

  return {
    success: true,
    data: transfer,
  };
};

// Mismatches
export const listStockMismatches = async (req, res, next) => {
  const db = getDB();

  const { status = "PENDING", page = 1, limit = 20 } = req.query;

  const match = {};
  if (status) match.status = status;

  const data = await db
    .collection("stock_mismatches")
    .aggregate([
      { $match: match },

      {
        $lookup: {
          from: "branches",
          localField: "destinationBranchId",
          foreignField: "_id",
          as: "destinationBranch",
        },
      },
      { $unwind: "$destinationBranch" },

      {
        $lookup: {
          from: "product_variants",
          localField: "variantId",
          foreignField: "_id",
          as: "variant",
        },
      },
      { $unwind: "$variant" },

      {
        $project: {
          mismatchQty: 1,
          sentQty: 1,
          receivedQty: 1,
          status: 1,
          createdAt: 1,

          destinationBranchName: "$destinationBranch.name",
          sku: "$variant.sku",
          attributes: "$variant.attributes",
        },
      },

      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: Number(limit) },
    ])
    .toArray();

  res.json({
    success: true,
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      hasMore: data.length === Number(limit),
    },
  });
};

export const resolveStockMismatch = async (req, res, next) => {
  const session = getDB().client.startSession();

  try {
    const db = getDB();
    const mismatchId = new ObjectId(req.params.id);
    const { resolutionType, note } = req.body;

    session.startTransaction();

    const mismatch = await db
      .collection("stock_mismatches")
      .findOne({ _id: mismatchId }, { session });

    if (!mismatch) throw new Error("Mismatch not found");
    if (mismatch.status === "RESOLVED")
      throw new Error("Mismatch already resolved");

    const qty = mismatch.mismatchQty;

    /* ===============================
       RESOLUTION TYPES
    =============================== */

    // 1️⃣ LOSS → remove from MAIN warehouse
    if (resolutionType === "LOSS") {
      await decrementStockCache({
        db,
        session,
        branchId: mismatch.tempWarehouseId,
        variantId: mismatch.variantId,
        qty,
      });

      await recordStockMovement({
        db,
        session,
        branchId: mismatch.tempWarehouseId,
        variantId: mismatch.variantId,
        type: STOCK_MOVEMENT_TYPES.STOCK_ADJUSTMENT,
        qty: -qty,
        refType: "STOCK_MISMATCH",
        refId: mismatchId,
        note: "Written off as loss",
      });
    }

    // 2️⃣ FOUND → move to destination
    if (resolutionType === "FOUND") {
      await upsertStock({
        db,
        session,
        branchId: mismatch.destinationBranchId,
        variantId: mismatch.variantId,
        qty,
      });

      await decrementStockCache({
        db,
        session,
        branchId: mismatch.tempWarehouseId,
        variantId: mismatch.variantId,
        qty,
      });

      await recordStockMovement({
        db,
        session,
        branchId: mismatch.destinationBranchId,
        variantId: mismatch.variantId,
        type: STOCK_MOVEMENT_TYPES.TRANSFER_ADJUSTMENT,
        qty,
        refType: "STOCK_MISMATCH",
        refId: mismatchId,
        note: "Recovered stock",
      });
    }

    // 3️⃣ RETURN_TO_SOURCE
    if (resolutionType === "RETURN_TO_SOURCE") {
      await upsertStock({
        db,
        session,
        branchId: mismatch.sourceBranchId,
        variantId: mismatch.variantId,
        qty,
      });

      await decrementStockCache({
        db,
        session,
        branchId: mismatch.tempWarehouseId,
        variantId: mismatch.variantId,
        qty,
      });

      await recordStockMovement({
        db,
        session,
        branchId: mismatch.sourceBranchId,
        variantId: mismatch.variantId,
        type: STOCK_MOVEMENT_TYPES.TRANSFER_ADJUSTMENT,
        qty,
        refType: "STOCK_MISMATCH",
        refId: mismatchId,
        note: "Returned to source branch",
      });
    }

    /* ===============================
       MARK RESOLVED
    =============================== */
    await db.collection("stock_mismatches").updateOne(
      { _id: mismatchId },
      {
        $set: {
          status: "RESOLVED",
          resolutionType,
          resolvedBy: new ObjectId(req.user._id),
          resolvedAt: new Date(),
          note: note || null,
        },
      },
      { session },
    );

    await session.commitTransaction();

    res.json({ success: true });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};
