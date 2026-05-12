import { COLLECTIONS } from "../database/collections.js";

export const getMainBranch = async (db, session = null) => {
  const query = { isMain: true, status: "active" };

  const options = session ? { session } : {};

  const branch = await db
    .collection(COLLECTIONS.BRANCHES)
    .findOne(query, options);

  if (!branch) {
    throw new Error("Main branch (WH-MAIN) not found");
  }

  return branch;
};
