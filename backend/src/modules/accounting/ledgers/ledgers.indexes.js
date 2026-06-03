// modules/accounting/ledgers/ledgers.indexes.js
import { COLLECTIONS } from "../../../database/collections.js";
import { ensureIndex } from "../../../database/indexManager.js";

export async function ledgersIndexes(db) {
  const col = db.collection(COLLECTIONS.LEDGERS);

  await ensureIndex(
    col,
    { accountId: 1, branchId: 1, date: -1, createdAt: -1, _id: -1 },
    { name: "idx_ledger_atomic_balance_lookup" },
  );

  await ensureIndex(
    col,
    { branchId: 1, accountId: 1, date: 1 },
    { name: "idx_ledger_financial_reporting" },
  );

  await ensureIndex(
    col,
    { partyId: 1, partyType: 1, branchId: 1, date: 1, createdAt: 1 },
    { name: "idx_party_unified_statement_v2" },
  );

  await ensureIndex(
    col,
    { partyId: 1, partyType: 1, branchId: 1, refType: 1, refId: 1, date: 1 },
    { name: "idx_party_aging_and_settlement" },
  );

  await ensureIndex(
    col,
    { refType: 1, refId: 1 },
    { name: "idx_ledger_module_audit_pivot" },
  );
}
