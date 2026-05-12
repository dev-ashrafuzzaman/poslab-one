// modules/accounting/reports/profitLoss.report.js

import { COLLECTIONS } from "../../../../database/collections.js";

export const profitLossReport = async ({
  db,
  fromDate,
  toDate,
  branchId = null
}) => {
  const match = {
    date: { $gte: fromDate, $lte: toDate }
  };
  if (branchId) match.branchId = branchId;

  const rows = await db.collection(COLLECTIONS.LEDGERS).aggregate([
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
          type: "$acc.type",
          code: "$acc.code",
          name: "$acc.name"
        },
        debit: { $sum: "$debit" },
        credit: { $sum: "$credit" }
      }
    },
    {
      $project: {
        type: "$_id.type",
        code: "$_id.code",
        name: "$_id.name",
        amount: {
          $cond: [
            { $eq: ["$_id.type", "INCOME"] },
            "$credit",
            "$debit"
          ]
        }
      }
    },
    { $sort: { code: 1 } }
  ]).toArray();

  const income = [];
  const expense = [];

  let totalIncome = 0;
  let totalExpense = 0;

  for (const r of rows) {
    if (r.type === "INCOME") {
      income.push({ code: r.code, name: r.name, amount: r.amount });
      totalIncome += r.amount;
    } else {
      expense.push({ code: r.code, name: r.name, amount: r.amount });
      totalExpense += r.amount;
    }
  }

  return {
    period: { from: fromDate, to: toDate },
    income,
    expense,
    totals: {
      income: totalIncome,
      expense: totalExpense,
      profit: totalIncome - totalExpense
    }
  };
};
