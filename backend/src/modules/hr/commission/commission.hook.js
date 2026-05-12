import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../database/collections.js";

export const resolveCommissionRule = async ({
  db,
  branchId,
  role,
  salesAmount,
}) => {
  return db.collection(COLLECTIONS.COMMISSION_RULES).findOne({
    branchId: new ObjectId(branchId),
    role,
    minSalesAmount: { $lte: salesAmount },
    status: "active",
  });
};
