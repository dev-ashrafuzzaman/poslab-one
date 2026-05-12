import { trialBalanceReport } from "../trialBalance/trialBalance.report.js";

export const balanceSheetReport = async ({ db, toDate, branchId = null }) => {

  const tb = await trialBalanceReport({
    db,
    toDate,
    branchId,
  });

  const assets = {
    current: [],
    nonCurrent: [],
  };

  const liabilities = {
    current: [],
    longTerm: [],
  };

  const equity = [];

  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEquity = 0;

  /* =========================
     CLASSIFY ACCOUNTS
  ========================== */

  for (const row of tb.rows) {

    /* ---------- ASSETS ---------- */

    if (row.type === "ASSET") {

      if (row.closingDebit > 0) {
        const item = {
          code: row.code,
          name: row.name,
          amount: row.closingDebit,
        };

        assets.current.push(item);
        totalAssets += row.closingDebit;
      }

      /* Overdrawn asset */
      if (row.closingCredit > 0) {
        const item = {
          code: row.code,
          name: `${row.name} (Overdrawn)`,
          amount: row.closingCredit,
        };

        liabilities.current.push(item);
        totalLiabilities += row.closingCredit;
      }
    }

    /* ---------- LIABILITIES ---------- */

    if (row.type === "LIABILITY") {

      if (row.closingCredit > 0) {
        liabilities.current.push({
          code: row.code,
          name: row.name,
          amount: row.closingCredit,
        });

        totalLiabilities += row.closingCredit;
      }

      /* Advance payment → Asset */

      if (row.closingDebit > 0) {
        assets.current.push({
          code: row.code,
          name: `${row.name} (Advance)`,
          amount: row.closingDebit,
        });

        totalAssets += row.closingDebit;
      }
    }

    /* ---------- EQUITY ---------- */

    if (row.type === "EQUITY" && row.closingCredit > 0) {
      equity.push({
        code: row.code,
        name: row.name,
        amount: row.closingCredit,
      });

      totalEquity += row.closingCredit;
    }
  }

  /* =========================
     CURRENT PERIOD PROFIT
  ========================== */

  let income = 0;
  let expense = 0;

  for (const row of tb.rows) {
    if (row.type === "INCOME") income += row.closingCredit;
    if (row.type === "EXPENSE") expense += row.closingDebit;
  }

  const profit = income - expense;

  if (profit !== 0) {
    equity.push({
      code: "P&L",
      name: "Current Period Profit / Loss",
      amount: profit,
    });

    totalEquity += profit;
  }

  /* =========================
     FINANCIAL METRICS
  ========================== */

  const workingCapital =
    totalAssets - totalLiabilities;

  const debtRatio =
    totalLiabilities / totalAssets;

  /* =========================
     BALANCE CHECK
  ========================== */

  const diff =
    Math.abs(
      totalAssets -
      (totalLiabilities + totalEquity)
    );

  const isBalanced = diff < 0.01;

  return {
    asOf: toDate,

    assets,
    liabilities,
    equity,

    totals: {
      assets: totalAssets,
      liabilities: totalLiabilities,
      equity: totalEquity,

      liabilitiesPlusEquity:
        totalLiabilities + totalEquity,

      workingCapital,
      debtRatio,

      isBalanced,
    },
  };
};