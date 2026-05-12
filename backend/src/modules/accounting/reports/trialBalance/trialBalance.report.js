import { ObjectId } from "mongodb";

export const trialBalanceReport = async ({
  db,
  fromDate,
  toDate,
  branchId = null,
}) => {
  /* =========================
     MATCH STAGE
  ========================== */
  const match = {
    date: { $lte: toDate },
  };

  if (fromDate) {
    match.date.$gte = fromDate;
  }

  if (branchId) {
    match.branchId = new ObjectId(branchId);
  }

  /* =========================
     AGGREGATION
  ========================== */
  const rows = await db.collection("ledgers").aggregate([
    { $match: match },

    /* --- group ledger by account --- */
    {
      $group: {
        _id: "$accountId",
        totalDebit: { $sum: "$debit" },
        totalCredit: { $sum: "$credit" },
      },
    },

    /* --- join chart of accounts --- */
    {
      $lookup: {
        from: "accounts",
        localField: "_id",
        foreignField: "_id",
        as: "account",
      },
    },
    { $unwind: "$account" },

    /* --- net balance calculation --- */
    {
      $addFields: {
        net: { $subtract: ["$totalDebit", "$totalCredit"] },
      },
    },

    /* --- closing side placement (ACCOUNTING RULE) --- */
    {
      $project: {
        accountId: "$_id",
        code: "$account.code",
        name: "$account.name",
        type: "$account.type",

        totalDebit: 1,
        totalCredit: 1,

        closingDebit: {
          $cond: [{ $gt: ["$net", 0] }, "$net", 0],
        },

        closingCredit: {
          $cond: [{ $lt: ["$net", 0] }, { $abs: "$net" }, 0],
        },
      },
    },

    { $sort: { code: 1 } },
  ]).toArray();

  /* =========================
     GRAND TOTAL
  ========================== */
  let totalDebit = 0;
  let totalCredit = 0;

  for (const row of rows) {
    totalDebit += row.closingDebit;
    totalCredit += row.closingCredit;
  }

  return {
    rows,
    totalDebit,
    totalCredit,
    isBalanced: totalDebit === totalCredit,
  };
};
