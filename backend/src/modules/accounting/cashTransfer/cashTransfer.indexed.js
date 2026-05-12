import { ensureIndex } from "../../../database/indexManager.js";

export async function cashTransferIndexes(db) {
  const col = db.collection("cash_transfers");

  /* ===================================================
     1️⃣ Branch Pending Transfers (🔥 Most Important)
  =================================================== */
  await ensureIndex(
    col,
    { fromBranchId: 1, status: 1 },
    { name: "idx_ct_from_status" }
  );

  /* ===================================================
     2️⃣ Incoming Transfers (Main / Branch)
  =================================================== */
  await ensureIndex(
    col,
    { toBranchId: 1, status: 1 },
    { name: "idx_ct_to_status" }
  );

  /* ===================================================
     3️⃣ Branch History (Sorted)
  =================================================== */
  await ensureIndex(
    col,
    { fromBranchId: 1, createdAt: -1 },
    { name: "idx_ct_from_created" }
  );

  /* ===================================================
     4️⃣ Admin Pending Dashboard
  =================================================== */
  await ensureIndex(
    col,
    { status: 1, createdAt: -1 },
    { name: "idx_ct_status_created" }
  );
}