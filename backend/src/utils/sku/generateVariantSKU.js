
export const generateVariantSKU = async ({ db, productId, productCode, session }) => {
  if (!productId || !productCode || typeof productCode !== "string") {
    throw new Error("Validation Error: Invalid productId or productCode structural data.");
  }

  const counterId = `VARIANT_${String(productId)}`;

  const counterResult = await db.collection("counters").findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      returnDocument: "after",
      session
    },
  );

  const sequence = counterResult?.seq ?? counterResult?.value?.seq;
  
  if (!sequence) {
    throw new Error(`Failed to initialize variant lot sequence for product context: ${counterId}`);
  }

  const variantSerial = String(sequence).padStart(3, "0");

  return {
    sku: `${productCode}${variantSerial}`, 
    variantCode: variantSerial,            
  };
};