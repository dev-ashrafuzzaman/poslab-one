import { ObjectId } from "mongodb";
import { getDB } from "../../../../config/db.js";

const formatBalance = (v) => ({
  amount: Math.abs(v),
  type: v >= 0 ? "DR" : "CR",
});

export const partyLedgerStatementReport = async ({
  partyId,
  fromDate,
  toDate,
}) => {
const db = await getDB();
  const partyObjectId = new ObjectId(partyId);

  const match = {
    partyId: partyObjectId,
  };

  if (fromDate || toDate) {
    match.date = {};
    if (fromDate) match.date.$gte = new Date(fromDate);
    if (toDate) match.date.$lte = new Date(toDate);
  }

  const ledgers = await db
    .collection("ledgers")
    .find(match)
    .sort({ date: 1, createdAt: 1 })
    .toArray();

  let runningBalance = 0;

  const rows = ledgers.map((l, i) => {

    runningBalance += (l.debit || 0) - (l.credit || 0);

    return {

      sl: i + 1,

      date: new Date(l.date).toLocaleDateString(),

      reference: l.voucherNo || l.narration,

      description: l.refType,

      debit: l.debit || 0,

      credit: l.credit || 0,

      balance: formatBalance(runningBalance),

    };

  });

  return {

    success: true,

    rows,

    closingBalance: formatBalance(runningBalance),

  };

};