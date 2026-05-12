import { COLLECTIONS } from "../../database/collections.js";
import { ensureObjectId } from "../../utils/ensureObjectId.js";

export const decrementStockCache = async ({
  db,
  session,
  branchId,
  variantId,
  qty,
}) => {
  if (!qty || qty <= 0) {
    throw new Error("Invalid stock decrement quantity");
  }

  branchId = ensureObjectId(branchId, "branchId");
  variantId = ensureObjectId(variantId, "variantId");

  const res = await db.collection(COLLECTIONS.STOCKS).updateOne(
    {
      branchId,
      variantId,
      qty: { $gte: qty }, // 🔥 Prevent negative
    },
    {
      $inc: { qty: -qty },
      $set: { updatedAt: new Date() },
    },
    { session }
  );

  if (res.matchedCount === 0) {
    throw new Error("Insufficient stock (Snapshot)");
  }
};
