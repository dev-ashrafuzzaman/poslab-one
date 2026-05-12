import { COLLECTIONS } from "../../database/collections.js";

export async function recordStockMovement({
  db,
  session,
  branchId,
  variantId,
  productId = null,
  type,
  qty,
  refType,
  refId,
  note = null,
}) {
  if (!branchId || !variantId || !type || !qty) {
    throw new Error("Invalid stock movement payload");
  }
  await db.collection(COLLECTIONS.STOCK_MOVEMENTS).insertOne(
    {
      branchId,
      variantId,
      productId,
      type,
      qty,
      refType,
      refId,
      note,
      createdAt: new Date(),
    },
    { session },
  );
}
