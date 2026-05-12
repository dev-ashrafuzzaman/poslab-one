import { ObjectId } from "mongodb";
import { generateCode } from "../../../utils/codeGenerator.js";
import { getDB } from "../../../config/db.js";

/* ===============================
   CREATE AUDIT
================================ */
export async function createAudit(branchId, userId, session) {
  const db = await getDB();

  const running = await db
    .collection("stock_audits")
    .findOne(
      { branchId: new ObjectId(branchId), status: "IN_PROGRESS" },
      { session },
    );

  if (running) throw new Error("Audit already running for this branch");

  const branch = await db
    .collection("branches")
    .findOne({ _id: new ObjectId(branchId) }, { session });

  if (!branch) {
    throw new Error("Branch not found");
  }

  const auditNo = await generateCode({
    db,
    module: "AUDIT",
    prefix: "AUD",
    scope: "YEAR",
    branch: branch.code,
    session,
  });

  const audit = {
    auditNo,
    branchId: new ObjectId(branchId),
    branchName: branch.name,
    status: "IN_PROGRESS",
    startedBy: new ObjectId(userId),
    startedAt: new Date(),
    totals: {},
  };

  await db.collection("stock_audits").insertOne(audit, { session });
  return audit;
}

/* ===============================
   GET SINGLE AUDIT (RESUME)
================================ */
export async function getAudit(auditId, { limit = 500 } = {}) {
  const db = await getDB();

  const audit = await db.collection("stock_audits").findOne(
    { _id: new ObjectId(auditId) },
    {
      projection: {
        auditNo: 1,
        status: 1,
        branchId: 1,
        startedAt: 1,
        totals: 1,
      },
    },
  );

  if (!audit) throw new Error("Audit not found");

  const items = await db
    .collection("stock_audit_items")
    .find({ auditId: audit._id })
    .project({
      sku: 1,
      productName: 1,
      systemQty: 1,
      auditQty: 1,
      differenceQty: 1,
      status: 1,
      salePrice: 1,
    })
    .sort({ productName: 1 })
    .limit(limit) // 🔥 protection
    .toArray();

  return { audit, items };
}

/* ===============================
   SCAN SKU
================================ */
export async function scanItem(auditId, sku, session) {
  const db = await getDB();

  const audit = await db.collection("stock_audits").findOne(
    { _id: new ObjectId(auditId), status: "IN_PROGRESS" },
    { session }
  );
  if (!audit) throw new Error("Audit not active");

  const stock = await db.collection("stocks").findOne({ sku, branchId: new ObjectId(audit.branchId) }, { session });
  if (!stock) throw new Error("Invalid SKU/Branch Mismatch");

  const col = db.collection("stock_audit_items");

  const existing = await col.findOne(
    { auditId: audit._id, sku },
    { session }
  );

  const currentAuditQty = existing?.auditQty || 0;

  // 🚫 HARD STOP (ERP RULE)
  if (currentAuditQty + 1 > stock.qty) {
    throw new Error(
      `Scan limit exceeded. System Qty: ${stock.qty}`
    );
  }

  // atomic upsert
  await col.updateOne(
    { auditId: audit._id, sku },
    {
      $setOnInsert: {
        auditId: audit._id,
        productId: stock.productId,
        variantId: stock.variantId,
        sku,
        productName: stock.productName,
        systemQty: stock.qty,
        salePrice: stock.salePrice,
        createdAt: new Date(),
      },
      $inc: { auditQty: 1 },
    },
    { upsert: true, session }
  );

  const item = await col.findOne(
    { auditId: audit._id, sku },
    { session }
  );

  const diffQty = item.auditQty - item.systemQty;
  const status =
    diffQty === 0 ? "MATCH" : diffQty < 0 ? "SHORT" : "EXCESS";

  await col.updateOne(
    { _id: item._id },
    {
      $set: {
        differenceQty: diffQty,
        differenceValue: diffQty * item.salePrice,
        status,
      },
    },
    { session }
  );

  return {
    ...item,
    differenceQty: diffQty,
    differenceValue: diffQty * item.salePrice,
    status,
  };
}

/* ===============================
   SUBMIT AUDIT
================================ */
export async function submitAudit(auditId, userId, session) {
  const db = await getDB();

  const audit = await db
    .collection("stock_audits")
    .findOne(
      { _id: new ObjectId(auditId), status: "IN_PROGRESS" },
      { session },
    );
  if (!audit) throw new Error("Audit already submitted");

  // 🔥 Mongo does the math
  const [totals] = await db
    .collection("stock_audit_items")
    .aggregate(
      [
        { $match: { auditId: audit._id } },
        {
          $group: {
            _id: null,
            systemQty: { $sum: "$systemQty" },
            auditQty: { $sum: "$auditQty" },
            varianceQty: { $sum: "$differenceQty" },
            systemValue: {
              $sum: { $multiply: ["$systemQty", "$salePrice"] },
            },
            auditValue: {
              $sum: { $multiply: ["$auditQty", "$salePrice"] },
            },
            varianceValue: { $sum: "$differenceValue" },
          },
        },
      ],
      { session },
    )
    .toArray();

  await db.collection("stock_audits").updateOne(
    { _id: audit._id },
    {
      $set: {
        status: "SUBMITTED",
        submittedBy: new ObjectId(userId),
        submittedAt: new Date(),
        totals: totals || {},
      },
    },
    { session },
  );

  return { success: true, totals };
}


export async function getAuditReport(auditId) {
  const db = await getDB();

  const audit = await db.collection("stock_audits").findOne({
    _id: new ObjectId(auditId),
  });
  if (!audit) throw new Error("Audit not found");

  const branch = await db.collection("branches").findOne({
    _id: audit.branchId,
  });

  const auditor = await db.collection("users").findOne(
    { _id: audit.startedBy },
    { projection: { name: 1, email: 1 } }
  );

  const items = await db
    .collection("stock_audit_items")
    .find({ auditId: audit._id })
    .sort({ productName: 1 })
    .toArray();

  return {
    audit,
    branch,
    auditor,
    items,
    generatedAt: new Date(),
  };
}