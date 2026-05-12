// modules/accounting/reports/balanceSheet.controller.js
import { getDB } from "../../../../config/db.js";
import { balanceSheetReport } from "./balanceSheet.report.js";

export const getBalanceSheet = async (req, res, next) => {
  try {
    const db = getDB();

    let toDate = new Date();

    if (req.query.to) {
      toDate = new Date(req.query.to);
      toDate.setHours(23, 59, 59, 999);
    }

    const report = await balanceSheetReport({
      db,
      toDate,
      branchId: req.query.branchId || null,
    });

    res.status(200).json({
      success: true,
      data: report,
    });

  } catch (err) {
    next(err);
  }
};