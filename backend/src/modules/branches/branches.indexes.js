// src/modules/branches/branches.indexes.js
import { COLLECTIONS } from "../../database/collections.js";
import { ensureIndex } from "../../database/indexManager.js";

export async function branchesIndexes(db) {
  const col = db.collection(COLLECTIONS.BRANCHES);

  await ensureIndex(col, { code: 1 }, { unique: true, name: "uniq_branch_code" });
  await ensureIndex(col, { status: 1 }, { name: "idx_branch_status" });
}
