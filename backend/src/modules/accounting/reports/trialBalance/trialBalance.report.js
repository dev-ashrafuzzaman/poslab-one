// modules/accounting/reports/trialBalance.report.js
import { ObjectId } from "mongodb";

/**
 * Enterprise Trial Balance Reporting Engine (ESR Indexed & Presentation Ready)
 * Computes penny-perfect multi-branch asset distributions with accounting side normalizations.
 */
export const trialBalanceReport = async ({
  db,
  fromDate,
  toDate,
  branchId = null,
}) => {
  /* ===================================================
     1. MATCH ENGINE (Strict Equality-Range Index Path)
     =================================================== */
  const match = {};

  if (branchId) {
    match.branchId = new ObjectId(branchId);
  }

  // Force strict date cast definitions to match backend indexing models
  match.date = { $lte: toDate ? new Date(toDate) : new Date() };
  if (fromDate) {
    match.date.$gte = new Date(fromDate);
  }

  /* ===================================================
     2. DYNAMIC AGGREGATION & NORMAL BALANCE ALIGNMENT
     =================================================== */
  const rows = await db.collection("ledgers").aggregate([
    // Optimized Match Execution hitting idx_ledger_financial_reporting index
    { $match: match },

    // Core grouping pipeline
    {
      $group: {
        _id: "$accountId",
        totalDebit: { $sum: "$debit" },
        totalCredit: { $sum: "$credit" },
      },
    },

    // Join Chart of Accounts using discrete field projection pipeline to save RAM cost
    {
      $lookup: {
        from: "accounts",
        localField: "_id",
        foreignField: "_id",
        pipeline: [{ $project: { code: 1, name: 1, type: 1 } }],
        as: "account",
      },
    },
    { $unwind: "$account" },

    // Calculate precision algebraic absolute margins
    {
      $addFields: {
        netValue: { $subtract: ["$totalDebit", "$totalCredit"] },
      },
    },

    // Apply strict GAAP layout evaluation architecture maps
    {
      $project: {
        _id: 0,
        accountId: "$_id",
        code: "$account.code",
        name: "$account.name",
        type: "$account.type",
        totalDebit: { $round: ["$totalDebit", 2] },
        totalCredit: { $round: ["$totalCredit", 2] },
        
        // Logical evaluation mapping base on normal balance accounting categories
        closingDebit: {
          $cond: [{ $gt: ["$netValue", 0] }, { $round: ["$netValue", 2] }, 0],
        },
        closingCredit: {
          $cond: [{ $lt: ["$netValue", 0] }, { $round: [{ $abs: "$netValue" }, 2] }, 0],
        },
      },
    },

    // Chronological order display sequencing sort
    { $sort: { code: 1 } },
  ]).toArray();

  /* ===================================================
     3. FORMATTING ENGINE LAYER (Penny-Perfect Transformations)
     =================================================== */
  let sumDebitRaw = 0;
  let sumCreditRaw = 0;

  // Global standard local standard localized string transformer formatting helper
  const currencyFormatter = (value) => {
    if (!value || value === 0) return "0";
    // Returns clean presentation string matrix like: 10,000 or 1,50,000 without decimal fractions
    return Number(Math.round(value)).toLocaleString("en-IN");
  };

  const processedRows = rows.map((row) => {
    sumDebitRaw += row.closingDebit;
    sumCreditRaw += row.closingCredit;

    return {
      ...row,
      // Rounded integers conversion holders
      closingDebitRounded: Math.round(row.closingDebit),
      closingCreditRounded: Math.round(row.closingCredit),
      
      // Highly attractive string matrix variables ready to render inside clean client tables
      closingDebitStr: currencyFormatter(row.closingDebit),
      closingCreditStr: currencyFormatter(row.closingCredit),
    };
  });

  const totalDebit = parseFloat(sumDebitRaw.toFixed(2));
  const totalCredit = parseFloat(sumCreditRaw.toFixed(2));

  return {
    generatedAt: new Date(),
    metaSummary: {
      totalDebitRaw: totalDebit,
      totalCreditRaw: totalCredit,
      totalDebitFormatted: currencyFormatter(totalDebit),
      totalCreditFormatted: currencyFormatter(totalCredit),
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    },
    rows: processedRows,
  };
};