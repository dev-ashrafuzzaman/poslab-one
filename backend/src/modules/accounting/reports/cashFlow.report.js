

import { balanceSheetReport } from "./balanceSheet/balanceSheet.report.js";
import { profitLossAdvancedReport } from "./profitLoss/profitLossAdvanced.report.js";

/* safe getter */
const getAmount = (section, code) =>
  section?.find((x) => x.code === code)?.amount || 0;

export const cashFlowReport = async ({
  db,
  fromDate,
  toDate,
  branchId = null,
}) => {

  /* ============================
     STEP 1: NET PROFIT
  ============================ */

  const pnl = await profitLossAdvancedReport({
    db,
    fromDate,
    toDate,
    branchId,
  });

  const netProfit = pnl.current?.netProfit || 0;

  /* ============================
     STEP 2: OPENING BALANCE SHEET
  ============================ */

  const openingDate = new Date(fromDate);
  openingDate.setMilliseconds(openingDate.getMilliseconds() - 1);

  const openingBS = await balanceSheetReport({
    db,
    toDate: openingDate,
    branchId,
  });

  const closingBS = await balanceSheetReport({
    db,
    toDate,
    branchId,
  });

  /* ============================
     STEP 3: WORKING CAPITAL
  ============================ */

  /* Receivable */

  const arOpening = getAmount(openingBS.assets.current, "1004");
  const arClosing = getAmount(closingBS.assets.current, "1004");

  const changeInAR = arClosing - arOpening;

  /* Inventory */

  const invOpening = getAmount(openingBS.assets.current, "1003");
  const invClosing = getAmount(closingBS.assets.current, "1003");

  const changeInInventory = invClosing - invOpening;

  /* Payable */

  const apOpening =
    getAmount(openingBS.liabilities.current, "2001") -
    getAmount(openingBS.assets.current, "2001");

  const apClosing =
    getAmount(closingBS.liabilities.current, "2001") -
    getAmount(closingBS.assets.current, "2001");

  const changeInAP = apClosing - apOpening;

  /* ============================
     OPERATING CASH FLOW
  ============================ */

  const cashFromOperations =
    netProfit
    - changeInAR
    - changeInInventory
    + changeInAP;

  /* ============================
     INVESTING ACTIVITIES
  ============================ */

  const equipmentOpening = getAmount(
    openingBS.assets.nonCurrent,
    "1501"
  );

  const equipmentClosing = getAmount(
    closingBS.assets.nonCurrent,
    "1501"
  );

  const equipmentPurchase =
    equipmentClosing - equipmentOpening;

  const investingCashFlow = -equipmentPurchase;

  /* ============================
     FINANCING ACTIVITIES
  ============================ */

  const capitalOpening = getAmount(
    openingBS.equity,
    "3001"
  );

  const capitalClosing = getAmount(
    closingBS.equity,
    "3001"
  );

  const changeInCapital =
    capitalClosing - capitalOpening;

  const financingCashFlow = changeInCapital;

  /* ============================
     NET CASH FLOW
  ============================ */

  const netCashFlow =
    cashFromOperations +
    investingCashFlow +
    financingCashFlow;

  return {
    period: {
      from: fromDate,
      to: toDate,
    },

    operating: {
      netProfit,

      adjustments: {
        changeInReceivable: changeInAR,
        changeInInventory: changeInInventory,
        changeInPayable: changeInAP,
      },

      cashFromOperations,
    },

    investing: {
      equipmentPurchase,
      investingCashFlow,
    },

    financing: {
      changeInCapital,
      financingCashFlow,
    },

    netCashFlow,
  };
};