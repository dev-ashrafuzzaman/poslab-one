import { COLLECTIONS } from "../database/collections.js";

export const generateSKU = async ({
  db,
  scope = "PRODUCT",
  prefixParts = []
}) => {
  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: scope },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  const seq = String(counter?.seq).padStart(5, "0");

  return [...prefixParts, seq].join("-");
};
