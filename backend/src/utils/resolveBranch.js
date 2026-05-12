// utils/resolveBranch.js
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../database/collections.js";
export const resolveBranch = async ({ db, user, session }) => {
  const query = { status: "active" };

  if (user.isSuperAdmin) {
    query.isMain = true;
  } else {
    if (!user.branchId) {
      throw new Error("User branch not assigned");
    }
    query._id = new ObjectId(user.branchId);
  }

  const branch = await db
    .collection(COLLECTIONS.BRANCHES)
    .findOne(query, { session });

  if (!branch) {
    throw new Error("Branch not found or inactive");
  }

  return branch;
};
