import { COLLECTIONS } from "../../database/collections.js";
import { ensureObjectId } from "../../utils/ensureObjectId.js";
import { roundMoney } from "../../utils/money.js";

export const restoreStockFIFO = async ({
  db,
  session,
  branchId,
  variantId,
  returnQty,
  salesReturnId,
}) => {
  branchId = ensureObjectId(branchId, "branchId");
  variantId = ensureObjectId(variantId, "variantId");
  salesReturnId = ensureObjectId(salesReturnId, "salesReturnId");

  let remaining = Number(returnQty);
  let restoredCogs = 0;

  // 🔁 Reverse FIFO = LIFO on PURCHASE layers
  const purchaseLayers = await db
    .collection(COLLECTIONS.STOCK_MOVEMENTS)
    .find(
      {
        branchId,
        variantId,
        type: "PURCHASE",
      },
      { session }
    )
    .sort({ createdAt: -1 })
    .toArray();

  for (const layer of purchaseLayers) {
    if (remaining <= 0) break;

    const consumedQty = layer.qty - (layer.balanceQty ?? 0);
    if (consumedQty <= 0) continue;

    const restoreQty = Math.min(consumedQty, remaining);

    await db.collection(COLLECTIONS.STOCK_MOVEMENTS).updateOne(
      { _id: layer._id },
      { $inc: { balanceQty: restoreQty } },
      { session }
    );

    restoredCogs += restoreQty * layer.costPrice;
    remaining -= restoreQty;
  }

  if (remaining > 0) {
    throw new Error("Invalid sales return quantity");
  }

  // Audit-only movement
  await db.collection(COLLECTIONS.STOCK_MOVEMENTS).insertOne(
    {
      branchId,
      variantId,
      type: "SALE_RETURN",
      qty: returnQty,
      refType: "SALE_RETURN",
      refId: salesReturnId,
      createdAt: new Date(),
    },
    { session }
  );

  return roundMoney(restoredCogs);
};
