import { ObjectId } from "mongodb";
import { consumeStockFIFOWithLayers } from "../inventory/consumeStockFIFO.js";
import { generateCode } from "../../utils/codeGenerator.js";
import { COLLECTIONS } from "../../database/collections.js";

export const createStockTransferService = async ({
  db,
  session,
  fromBranchId,
  toBranchId,
  items,
  userId = null,
}) => {

  fromBranchId = new ObjectId(fromBranchId);
  toBranchId = new ObjectId(toBranchId);

  if (fromBranchId.toString() === toBranchId.toString()) {
    throw new Error("Source & destination cannot be same");
  }

  const transferNo = await generateCode({
    db,
    session,
    module: "STOCK_TRANSFER",
    prefix: "ST",
    scope: "YEAR",
  });

  const { insertedId: transferId } = await db
    .collection("stock_transfers")
    .insertOne({
      transferNo,
      fromBranchId,
      toBranchId,
      status: "PENDING",
      totalItems: items.length,
      createdBy: userId ? new ObjectId(userId) : null,
      createdAt: new Date(),
    }, { session });

  const transferItemDocs = [];
  const snapshotBulk = [];
  const movementBulk = [];

  for (const item of items) {

    const variantId = new ObjectId(item.variantId);
    const qty = Number(item.qty);

    const layers = await consumeStockFIFOWithLayers({
      db,
      session,
      branchId: fromBranchId,
      variantId,
      qty,
    });

    transferItemDocs.push({
      transferId,
      variantId,
      sentQty: qty,
      receivedQty: 0,
      layers,
      status: "PENDING",
      createdAt: new Date(),
    });

    snapshotBulk.push({
      updateOne: {
        filter: { branchId: fromBranchId, variantId },
        update: {
          $inc: { qty: -qty },
          $set: { updatedAt: new Date() },
        },
      },
    });

    movementBulk.push({
      insertOne: {
        document: {
          branchId: fromBranchId,
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

  if (transferItemDocs.length)
    await db.collection("stock_transfer_items")
      .insertMany(transferItemDocs, { session });

  if (snapshotBulk.length)
    await db.collection(COLLECTIONS.STOCKS)
      .bulkWrite(snapshotBulk, { session });

  if (movementBulk.length)
    await db.collection(COLLECTIONS.STOCK_MOVEMENTS)
      .bulkWrite(movementBulk, { session });

  return { transferId, transferNo };
};


export const receiveStockTransferService = async ({
  db,
  session,     // ✅ session pass হবে
  transferId,
  userId = null,
}) => {

  transferId = new ObjectId(transferId);

  const transfer = await db.collection("stock_transfers")
    .findOne({ _id: transferId }, { session });

  if (!transfer) throw new Error("Transfer not found");
  if (transfer.status !== "PENDING")
    throw new Error("Transfer already processed");

  const toBranchId = new ObjectId(transfer.toBranchId);

  const transferItems = await db.collection("stock_transfer_items")
    .find({ transferId }, { session })
    .toArray();

  const purchaseBulk = [];
  const snapshotBulk = [];
  const movementBulk = [];

  for (const item of transferItems) {

    const variantObjectId = new ObjectId(item.variantId);
    let remaining = Number(item.sentQty);

    const variant = await db.collection(COLLECTIONS.VARIANTS)
      .findOne({ _id: variantObjectId }, { session });

    if (!variant) throw new Error("Variant not found");

    for (const layer of item.layers || []) {

      if (remaining <= 0) break;

      const portionQty = Math.min(layer.qty, remaining);

      purchaseBulk.push({
        insertOne: {
          document: {
            branchId: toBranchId,
            variantId: variantObjectId,
            productId: variant.productId,
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

      snapshotBulk.push({
        updateOne: {
          filter: {
            branchId: toBranchId,
            variantId: variantObjectId,
          },
          update: {
            $inc: { qty: portionQty },
            $setOnInsert: {
              branchId: toBranchId,
              variantId: variantObjectId,
              productId: variant.productId,
              productName: variant.productName || null,
              sku: variant.sku,
              attributes: variant.attributes,
              searchableText: variant.sku,
              salePrice: variant.salePrice,
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
            variantId: variantObjectId,
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

  if (purchaseBulk.length)
    await db.collection(COLLECTIONS.STOCK_MOVEMENTS)
      .bulkWrite(purchaseBulk, { session });

  if (snapshotBulk.length)
    await db.collection(COLLECTIONS.STOCKS)
      .bulkWrite(snapshotBulk, { session });

  if (movementBulk.length)
    await db.collection(COLLECTIONS.STOCK_MOVEMENTS)
      .bulkWrite(movementBulk, { session });

  await db.collection("stock_transfers").updateOne(
    { _id: transferId },
    {
      $set: {
        status: "RECEIVED",
        receivedAt: new Date(),
        receivedBy: userId ? new ObjectId(userId) : null,
      },
    },
    { session }
  );
};