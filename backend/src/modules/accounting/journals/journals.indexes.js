import { COLLECTIONS } from "../../../database/collections.js";
import { ensureIndex } from "../../../database/indexManager.js";

/**
 * Enterprise Index Optimizations for Financial Integrity and Fast Ledger Auditing
 */
export async function journalsIndexes(db) {
  const col = db.collection(COLLECTIONS.JOURNALS);

  // Voucher lookup (Strict uniqueness tracking)
  await ensureIndex(
    col,
    { voucherNo: 1 },
    { unique: true, name: "uniq_journal_voucher" },
  );

  // Multi-Branch and Date Range Reports Analysis Filter
  await ensureIndex(
    col,
    { branchId: 1, date: 1 },
    { name: "idx_journal_branch_date" },
  );

  // Cross-Module Document Snapshot Lookup (Audit Trail Lookup)
  await ensureIndex(col, { refType: 1, refId: 1 }, { name: "idx_journal_ref" });
}

export async function ledgersIndexes(db) {
  const col = db.collection(COLLECTIONS.LEDGERS);

  /* 🔥 Running Balance Atomic Filter (Strict Compound Sort Matching) */
  await ensureIndex(
    col,
    { accountId: 1, branchId: 1, date: -1, createdAt: -1, _id: -1 },
    { name: "idx_ledger_balance_compound_lookup" },
  );

  /* Live Balance Sheet & Trial Balance Processing Engine Index */
  await ensureIndex(
    col,
    { branchId: 1, date: 1, accountId: 1 },
    { name: "idx_ledger_tb_match" },
  );

  /* Omni-Channel Unified Contact Ledger (Customer/Supplier Balance Sheets) */
  await ensureIndex(
    col,
    { partyId: 1, branchId: 1, date: 1, createdAt: 1 },
    { name: "idx_party_statement" },
  );

  /* Credit Control & Aging Analysis Logs (FIFO Clearance Queue) */
  await ensureIndex(
    col,
    { partyId: 1, branchId: 1, refId: 1, date: 1 },
    { name: "idx_party_invoice_group" },
  );

  /* Reference Pivot Lookups */
  await ensureIndex(col, { refType: 1, refId: 1 }, { name: "idx_ledger_ref" });
}
