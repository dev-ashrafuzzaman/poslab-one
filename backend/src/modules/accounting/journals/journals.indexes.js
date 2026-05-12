// src/modules/journals/journals.indexes.js

import { COLLECTIONS } from "../../../database/collections.js";
import { ensureIndex } from "../../../database/indexManager.js";

export async function journalsIndexes(db) {
  const col = db.collection(COLLECTIONS.JOURNALS);

  // Voucher lookup (print / audit)
  await ensureIndex(
    col,
    { voucherNo: 1 },
    { unique: true, name: "uniq_journal_voucher" }
  );

  // Branch-wise report
  await ensureIndex(
    col,
    { branchId: 1, date: 1 },
    { name: "idx_journal_branch_date" }
  );

  // Reference based lookup (SALE / PURCHASE / etc)
  await ensureIndex(
    col,
    { refType: 1, refId: 1 },
    { name: "idx_journal_ref" }
  );
}
