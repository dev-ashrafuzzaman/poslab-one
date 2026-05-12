// utils/sku/generateVariantSKU.js

/**
 * Generates full SKU = TT + PPPP + VVV
 * Example: 010001 + 001 => 010001001
 */
export const generateVariantSKU = async ({ db, productId, productCode, session }) => {
  if (!productId || !productCode || productCode.length !== 6) {
    throw new Error("Invalid productId or productCode");
  }

  const counterId = `VARIANT_${productId}`;

  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      returnDocument: "after",
      session
    },
  );

  const variantSerial = String(counter.seq).padStart(3, "0");

  // TT + PPPP + VVV
  return `${productCode}${variantSerial}`; // e.g. 010001001
};
