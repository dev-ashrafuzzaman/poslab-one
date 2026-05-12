import { COLLECTIONS } from "../../database/collections.js";

export const createSupplier = async ({ db, payload }) => {
  const supplier = {
    ...payload,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db
    .collection(COLLECTIONS.SUPPLIERS)
    .insertOne(supplier);

  return { ...supplier, _id: result.insertedId };
};
