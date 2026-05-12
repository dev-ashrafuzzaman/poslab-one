import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../database/collections.js";

export const upsertCustomerBranch = async ({
  db,
  customerId,
  branchId,
  branchName,
  session
}) => {
  return db.collection(COLLECTIONS.CUSTOMER_BRANCHES).updateOne(
    {
      customerId: new ObjectId(customerId),
      branchId: new ObjectId(branchId)
    },
    {
      $setOnInsert: {
        customerId: new ObjectId(customerId),
        branchId: new ObjectId(branchId),
        branchName,
        firstUsedAt: new Date()
      },
      $set: {
        lastUsedAt: new Date()
      }
    },
    {
      upsert: true,
      session
    }
  );
};
