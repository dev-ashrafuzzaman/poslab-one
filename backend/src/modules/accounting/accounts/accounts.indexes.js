import { COLLECTIONS } from "../../../database/collections.js";
import { ensureIndex } from "../../../database/indexManager.js";

// src/modules/accounts/accounts.indexes.js
export async function accountsIndexes(db) {
  const col = db.collection(COLLECTIONS.ACCOUNTS);

  /* ------------------------------------------------
   * 1️⃣ Account Code Uniqueness (CORE RULE)
   * ------------------------------------------------
   * Example: 1001, 2001, 4001 
   */
  await ensureIndex(
    col,
    { code: 1 },
    {
      unique: true,
      name: "uniq_account_code",
    }
  );

  /* ------------------------------------------------
   * 2️⃣ Account Type Lookup (Reports)
   * ------------------------------------------------
   * Used for:
   * - Trial Balance
   * - P&L
   * - Balance Sheet
   * - Year Closing
   */
  await ensureIndex(
    col,
    { type: 1 },
    {
      name: "idx_account_type",
    }
  );

  /* ------------------------------------------------
   * 3️⃣ Active Accounts Only (UI + Posting Safety)
   * ------------------------------------------------ */
  await ensureIndex(
    col,
    { status: 1 },
    {
      name: "idx_account_status",
    }
  );

  /* ------------------------------------------------
   * 4️⃣ Parent–Child (Chart Tree)
   * ------------------------------------------------
   * Used for:
   * - COA hierarchy
   * - Group totals
   */
  await ensureIndex(
    col,
    { parentId: 1 },
    {
      name: "idx_account_parent",
    }
  );

  /* ------------------------------------------------
   * 5️⃣ Branch-wise COA (Optional / Future-proof)
   * ------------------------------------------------
   * If accounts are shared globally → branchId = null
   */
  await ensureIndex(
    col,
    { branchId: 1 },
    {
      name: "idx_account_branch",
    }
  );
}
