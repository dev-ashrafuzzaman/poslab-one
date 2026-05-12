import { COLLECTIONS } from "../../../database/collections.js";
import { ensureIndex } from "../../../database/indexManager.js";

export async function ledgersIndexes(db) {
  const col = db.collection(COLLECTIONS.LEDGERS);

  /* 🔥 Running Balance (Most Critical) */
  await ensureIndex(
    col,
    { accountId: 1, branchId: 1, date: -1, createdAt: -1 },
    { name: "idx_ledger_balance_lookup" }
  );

  /* Trial Balance */
  await ensureIndex(
    col,
    { branchId: 1, date: 1, accountId: 1 },
    { name: "idx_ledger_tb_match" }
  );

  /* Party Statement */
  await ensureIndex(
    col,
    { partyId: 1, branchId: 1, date: 1, createdAt: 1 },
    { name: "idx_party_statement" }
  );

  /* Invoice Aging */
  await ensureIndex(
    col,
    { partyId: 1, branchId: 1, refId: 1, date: 1 },
    { name: "idx_party_invoice_group" }
  );

  /* Reference Lookup */
  await ensureIndex(
    col,
    { refType: 1, refId: 1 },
    { name: "idx_ledger_ref" }
  );
}