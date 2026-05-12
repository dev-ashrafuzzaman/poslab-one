// modules/accounting/reports/trialBalance.controller.js
import { getDB } from "../../../../config/db.js";
import { trialBalanceReport } from "./trialBalance.report.js";

export const getTrialBalance = async (req, res, next) => {
  try {
    const db = getDB();

    const report = await trialBalanceReport({
      db,
      fromDate: req.query.from ? new Date(req.query.from) : null,
      toDate: req.query.to ? new Date(req.query.to) : new Date(),
      branchId: req.query.branchId || null,
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};
