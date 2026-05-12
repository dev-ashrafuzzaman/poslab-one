import { COLLECTIONS } from "../../../../database/collections.js";
import { postJournalEntry } from "../../journals/journals.service.js";


export const yearClosingService = async ({
  db,
  fiscalYearEndDate,
  retainedEarningsAccountId,
  branchId = null
}) => {
  /**
   * 1️⃣ Aggregate Income & Expense till year end
   */
  const match = {
    date: { $lte: fiscalYearEndDate }
  };
  if (branchId) match.branchId = branchId;

  const pnl = await db.collection(COLLECTIONS.LEDGERS).aggregate([
    { $match: match },
    {
      $lookup: {
        from: "accounts",
        localField: "accountId",
        foreignField: "_id",
        as: "acc"
      }
    },
    { $unwind: "$acc" },
    {
      $match: {
        "acc.type": { $in: ["INCOME", "EXPENSE"] }
      }
    },
    {
      $group: {
        _id: {
          accountId: "$accountId",
          type: "$acc.type"
        },
        debit: { $sum: "$debit" },
        credit: { $sum: "$credit" }
      }
    }
  ]).toArray();

  let totalIncome = 0;
  let totalExpense = 0;

  const entries = [];

  for (const row of pnl) {
    if (row._id.type === "INCOME") {
      const amount = row.credit;
      if (amount > 0) {
        // Close income: Dr Income
        entries.push({
          accountId: row._id.accountId,
          debit: amount
        });
        totalIncome += amount;
      }
    }

    if (row._id.type === "EXPENSE") {
      const amount = row.debit;
      if (amount > 0) {
        // Close expense: Cr Expense
        entries.push({
          accountId: row._id.accountId,
          credit: amount
        });
        totalExpense += amount;
      }
    }
  }

  const netResult = totalIncome - totalExpense;

  /**
   * 2️⃣ Transfer net result to Retained Earnings
   */
  if (netResult > 0) {
    // Profit → Cr Retained Earnings
    entries.push({
      accountId: retainedEarningsAccountId,
      credit: netResult
    });
  }

  if (netResult < 0) {
    // Loss → Dr Retained Earnings
    entries.push({
      accountId: retainedEarningsAccountId,
      debit: Math.abs(netResult)
    });
  }

  if (entries.length === 0) {
    throw new Error("No income or expense found for year closing");
  }

  /**
   * 3️⃣ Post ONE closing journal
   */
  await postJournalEntry({
    db,
    date: fiscalYearEndDate,
    refType: "YEAR_CLOSING",
    refId: null,
    narration: `Year Closing as of ${fiscalYearEndDate.getFullYear()}`,
    entries,
    branchId
  });

  return {
    totalIncome,
    totalExpense,
    netResult
  };
};
