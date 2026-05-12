import { COLLECTIONS } from "../../database/collections.js";
import { roundMoney } from "../../utils/money.js";

export const consumeStockFIFO = async ({
  db,
  session,
  branchId,
  variantId,
  saleQty,
  saleId,
}) => {
  let remainingQty = saleQty;
  let totalCogs = 0;

  const purchaseLayers = await db
    .collection(COLLECTIONS.STOCK_MOVEMENTS)
    .find(
      {
        branchId,
        variantId,
        type: "PURCHASE",
        balanceQty: { $gt: 0 },
      },
      { session },
    )
    .sort({ createdAt: 1 }) // FIFO
    .toArray();

  for (const layer of purchaseLayers) {
    if (remainingQty <= 0) break;

    const consumeQty = Math.min(layer.balanceQty, remainingQty);

    totalCogs += consumeQty * layer.costPrice;

    await db
      .collection(COLLECTIONS.STOCK_MOVEMENTS)
      .updateOne(
        { _id: layer._id },
        { $inc: { balanceQty: -consumeQty } },
        { session },
      );

    remainingQty -= consumeQty;
  }

  if (remainingQty > 0) {
    throw new Error("Insufficient stock (FIFO)");
  }

  // ✅ SALE movement (NO balanceQty here)
  await db.collection(COLLECTIONS.STOCK_MOVEMENTS).insertOne(
    {
      branchId,
      variantId,
      type: "SALE",
      qty: -saleQty,
      refType: "SALE",
      refId: saleId,
      createdAt: new Date(),
    },
    { session },
  );

  return roundMoney(totalCogs);
};

export const consumeStockFIFOWithLayers = async ({
  db,
  session,
  branchId,
  variantId,
  qty,
}) => {
  if (!Number.isInteger(qty) || qty <= 0) {
    throw new Error("Invalid transfer quantity");
  }

  let remaining = qty;
  const consumedLayers = [];

  const layers = await db
    .collection(COLLECTIONS.STOCK_MOVEMENTS)
    .find(
      {
        branchId,
        variantId,
        type: "PURCHASE",
        balanceQty: { $gt: 0 },
      },
      { session },
    )
    .sort({ createdAt: 1 })
    .toArray();

  const bulkOps = [];

  for (const layer of layers) {
    if (remaining <= 0) break;

    const consumeQty = Math.min(layer.balanceQty, remaining);

    consumedLayers.push({
      purchaseLayerId: layer._id,
      qty: consumeQty,
      costPrice: layer.costPrice,
    });

    bulkOps.push({
      updateOne: {
        filter: { _id: layer._id },
        update: { $inc: { balanceQty: -consumeQty } },
      },
    });

    remaining -= consumeQty;
  }

  if (remaining > 0) {
    throw new Error("Insufficient stock for transfer");
  }

  if (bulkOps.length) {
    await db
      .collection(COLLECTIONS.STOCK_MOVEMENTS)
      .bulkWrite(bulkOps, { session });
  }

  return consumedLayers;
};
