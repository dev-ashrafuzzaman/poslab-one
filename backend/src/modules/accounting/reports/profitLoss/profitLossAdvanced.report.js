// modules/accounting/reports/profitLossAdvanced.report.js

import { trialBalanceReport } from "../trialBalance/trialBalance.report.js";

/**
 * Utility: sum rows safely
 */
const sum = (rows, filterFn, side) =>
  rows.filter(filterFn).reduce((t, r) => t + (r[side] || 0), 0);

/**
 * CORE P&L CALCULATION FROM TRIAL BALANCE
 */
const calculatePL = (tb) => {
  const rows = tb.rows;

  const sales = sum(
    rows,
    (r) => r.type === "INCOME" && r.code === "3001",
    "closingCredit"
  );

  const otherIncome = sum(
    rows,
    (r) => r.type === "INCOME" && r.code !== "3001",
    "closingCredit"
  );

  const cogs = sum(
    rows,
    (r) => r.type === "EXPENSE" && r.code === "4007",
    "closingDebit"
  );

  /**
   * EXPENSE BREAKDOWN
   */
  const expenseBreakdown = rows
    .filter(
      (r) =>
        r.type === "EXPENSE" &&
        r.code !== "4007" &&
        (r.closingDebit || 0) > 0
    )
    .map((r) => ({
      code: r.code,
      name: r.name,
      amount: r.closingDebit,
    }));

  const operatingExpense = expenseBreakdown.reduce(
    (t, e) => t + e.amount,
    0
  );

  const grossProfit = sales - cogs;
  const netProfit = grossProfit - operatingExpense + otherIncome;

  return {
    sales,
    cogs,
    grossProfit,
    operatingExpense,
    expenseBreakdown,
    otherIncome,
    netProfit,
  };
};
export const profitLossAdvancedReport = async ({
  db,
  fromDate,
  toDate,
  compareFrom = null,
  compareTo = null,
  branchId = null,
}) => {
  /**
   * CURRENT PERIOD
   */
  const currentTB = await trialBalanceReport({
    db,
    fromDate,
    toDate,
    branchId,
  });

  const current = calculatePL(currentTB);

  /**
   * COMPARATIVE PERIOD
   */
  let comparative = null;

  if (compareFrom && compareTo) {
    const cmpTB = await trialBalanceReport({
      db,
      fromDate: compareFrom,
      toDate: compareTo,
      branchId,
    });

    comparative = calculatePL(cmpTB);
  }

  /**
   * FINAL RESPONSE
   */
  return {
    period: {
      fromDate,
      toDate,
    },
    current,
    comparative,
  };
};
