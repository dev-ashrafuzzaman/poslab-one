// modules/accounting/reports/ledger/ledger.controller.js
import { ledgerReport } from "./ledger.report.js";
import { ledgerSummary } from "./ledger.summary.js";
import { ledgerAgingReport } from "./ledger.aging.js";
import { getDB } from "../../../../config/db.js";

export const getLedger = async (req, res, next) => {
  try {
    const db = getDB();

    const data = await ledgerReport({
      db,
      accountId: req.params.accountId,
      fromDate: req.query.from ? new Date(req.query.from) : null,
      toDate: req.query.to ? new Date(req.query.to) : null,
      branchId: req.query.branchId || null
    });

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

export const getLedgerSummary = async (req, res, next) => {
  try {
    const db = getDB();

    const data = await ledgerSummary({
      db,
      accountIds: req.body.accountIds,
      branchId: req.body.branchId
    });

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

export const getLedgerAging = async (req, res, next) => {
  try {
    const db = getDB();

    const data = await ledgerAgingReport({
      db,
      accountId: req.params.accountId,
      branchId: req.query.branchId,
      asOfDate: req.query.asOf ? new Date(req.query.asOf) : new Date()
    });

    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};
