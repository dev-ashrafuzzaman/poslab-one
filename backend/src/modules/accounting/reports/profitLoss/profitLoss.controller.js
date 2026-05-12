// modules/accounting/reports/profitLoss.controller.js
import { getDB } from "../../../../config/db.js";
import { cashFlowReport } from "../cashFlow.report.js";
import { profitLossReport } from "./profitLoss.report.js";
import { profitLossAdvancedReport } from "./profitLossAdvanced.report.js";

export const getProfitLoss = async (req, res, next) => {
  try {
    const db = getDB();

    const from = req.query.from
      ? new Date(req.query.from)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const to = req.query.to ? new Date(req.query.to) : new Date();

    const report = await profitLossReport({
      db,
      fromDate: from,
      toDate: to,
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

export const getAdvancedProfitLoss = async (req, res, next) => {
  try {
    const db = getDB();

    const parseDate = (d, end = false) => {
      const date = new Date(d);
      date.setHours(end ? 23 : 0, end ? 59 : 0, end ? 59 : 0, end ? 999 : 0);
      return date;
    };

    const report = await profitLossAdvancedReport({
      db,
      fromDate: parseDate(req.query.from),
      toDate: parseDate(req.query.to, true),
      compareFrom: req.query.compareFrom
        ? parseDate(req.query.compareFrom)
        : null,
      compareTo: req.query.compareTo
        ? parseDate(req.query.compareTo, true)
        : null,
      branchId: req.query.branchId || null,
    });

    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

export const getCashFlow = async (req, res, next) => {
  try {
    const db = getDB();

    const fromDate = new Date(req.query.from);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(req.query.to);
    toDate.setHours(23, 59, 59, 999);

    const report = await cashFlowReport({
      db,
      fromDate,
      toDate,
      branchId: req.query.branchId || null,
    });

    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};
