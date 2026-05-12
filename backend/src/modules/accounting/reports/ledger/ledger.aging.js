// modules/accounting/reports/ledger/ledger.aging.js
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../../../database/collections.js";

export const ledgerAgingReport = async ({
  db,
  accountId,
  branchId,
  asOfDate = new Date()
}) => {
  const match = {
    accountId: new ObjectId(accountId),
    ...(branchId && { branchId: new ObjectId(branchId) }),
    date: { $lte: asOfDate }
  };

  const rows = await db.collection(COLLECTIONS.LEDGERS)
    .find(match)
    .sort({ date: 1 })
    .toArray();

  let balance = 0;
  const buckets = { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };

  for (const r of rows) {
    balance += (r.debit || 0) - (r.credit || 0);

    if (balance === 0) continue;

    const days =
      (asOfDate - new Date(r.date)) / (1000 * 60 * 60 * 24);

    if (days <= 30) buckets["0-30"] += balance;
    else if (days <= 60) buckets["31-60"] += balance;
    else if (days <= 90) buckets["61-90"] += balance;
    else buckets["90+"] += balance;
  }

  return buckets;
};
