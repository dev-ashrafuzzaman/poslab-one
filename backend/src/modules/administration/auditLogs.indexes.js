import { COLLECTIONS } from "../../database/collections.js";
import { ensureIndex } from "../../database/indexManager.js";

export async function auditLogsIndexes(db) {
  const col = db.collection(COLLECTIONS.AUDIT_LOGS);

  /* ------------------------------------------------
   * 1️⃣ Branch-wise audit trail (MOST USED)
   * ------------------------------------------------ */
  await ensureIndex(
    col,
    { branchId: 1, createdAt: -1 },
    { name: "idx_activity_branch_date" }
  );

  /* ------------------------------------------------
   * 2️⃣ User activity history
   * ------------------------------------------------ */
  await ensureIndex(
    col,
    { userId: 1, createdAt: -1 },
    { name: "idx_activity_user_date" }
  );

  /* ------------------------------------------------
   * 3️⃣ Action filter (dropdown / report)
   * ------------------------------------------------ */
  await ensureIndex(
    col,
    { action: 1, createdAt: -1 },
    { name: "idx_activity_action_date" }
  );

  /* ------------------------------------------------
   * 4️⃣ Reference-based lookup (audit / rollback)
   * ------------------------------------------------ */
  await ensureIndex(
    col,
    { refType: 1, refId: 1 },
    { name: "idx_activity_ref" }
  );

  /* ------------------------------------------------
   * 5️⃣ Global timeline (admin audit)
   * ------------------------------------------------ */
  await ensureIndex(
    col,
    { createdAt: -1 },
    { name: "idx_activity_createdAt" }
  );
}
