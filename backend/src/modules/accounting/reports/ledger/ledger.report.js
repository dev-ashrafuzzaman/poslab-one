// modules/accounting/reports/ledger/ledger.report.js
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../../../database/collections.js";

export const ledgerReport = async ({
  db,
  accountId,
  fromDate,
  toDate,
  branchId,
  includeOpening = true
}) => {
  const match = {
    accountId: new ObjectId(accountId)
  };

  if (branchId) match.branchId = new ObjectId(branchId);
  if (fromDate || toDate) {
    match.date = {};
    if (fromDate) match.date.$gte = fromDate;
    if (toDate) match.date.$lte = toDate;
  }

  // Opening Balance
  let openingBalance = 0;
  if (includeOpening && fromDate) {
    const ob = await db.collection(COLLECTIONS.LEDGERS).aggregate([
      {
        $match: {
          accountId: new ObjectId(accountId),
          ...(branchId && { branchId: new ObjectId(branchId) }),
          date: { $lt: fromDate }
        }
      },
      { $sort: { date: 1 } },
      { $group: { _id: null, balance: { $last: "$balance" } } }
    ]).toArray();

    openingBalance = ob[0]?.balance || 0;
  }

  const rows = await db.collection("ledgers")
    .find(match)
    .sort({ date: 1, createdAt: 1 })
    .toArray();

  let runningBalance = openingBalance;

  const formatted = rows.map(r => {
    runningBalance += (r.debit || 0) - (r.credit || 0);

    return {
      date: r.date,
      narration: r.narration,
      refType: r.refType,
      refId: r.refId,
      debit: r.debit,
      credit: r.credit,
      balance: runningBalance
    };
  });

  return {
    openingBalance,
    transactions: formatted,
    closingBalance: runningBalance
  };
};
