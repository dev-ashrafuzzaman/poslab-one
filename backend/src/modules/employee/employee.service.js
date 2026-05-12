import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../database/collections.js";

export const createEmployee = async ({ db, payload }) => {
  if (!ObjectId.isValid(payload.branchId)) {
    throw new Error("Invalid branchId");
  }

  const employee = {
    ...payload,
    branchId: new ObjectId(payload.branchId),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection(COLLECTIONS.EMPLOYEES).insertOne(employee);

  return { ...employee, _id: result.insertedId };
};
