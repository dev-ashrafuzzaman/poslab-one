
export const generateProductCode = async ({ db, productTypeCode, session }) => {
  if (!productTypeCode) {
    throw new Error("Missing productTypeCode for generating unique sequence.");
  }

  const counterId = `PRODUCT_${String(productTypeCode).trim().toUpperCase()}`;

  const counterResult = await db.collection("counters").findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      returnDocument: "after",
      session,
    }
  );

  const sequence = counterResult?.seq ?? counterResult?.value?.seq;
  
  if (!sequence) {
    throw new Error(`Failed to initialize counter sequence for key: ${counterId}`);
  }

  return `${productTypeCode}${String(sequence).padStart(4, "0")}`;
};