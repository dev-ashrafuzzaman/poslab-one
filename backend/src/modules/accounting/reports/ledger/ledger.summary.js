// modules/accounting/reports/ledger/ledger.summary.js
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../../../database/collections.js";

export const ledgerSummary = async ({
  db,
  accountIds,
  branchId
}) => {
  const match = {};
  if (branchId) match.branchId = new ObjectId(branchId);

  if (accountIds?.length) {
    match.accountId = { $in: accountIds.map(id => new ObjectId(id)) };
  }

  return db.collection(COLLECTIONS.LEDGERS).aggregate([
    { $match: match },
    { $sort: { date: 1 } },
    {
      $group: {
        _id: "$accountId",
        debit: { $sum: "$debit" },
        credit: { $sum: "$credit" },
        balance: { $last: "$balance" }
      }
    }
  ]).toArray();
};
