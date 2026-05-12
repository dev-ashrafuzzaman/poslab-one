export const generateProductCode = async ({
  db,
  productTypeCode,
  session,
}) => {
  const counterId = `PRODUCT_${productTypeCode}`;

  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      returnDocument: "after",
      session,
    }
  );

  return `${productTypeCode}${String(counter.seq).padStart(4, "0")}`;
};
