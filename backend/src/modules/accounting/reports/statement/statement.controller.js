import { getDB } from "../../../../config/db.js";
import { partyInvoiceStatementReport, partyLedgerStatementReport, partyStatementReport } from "./statement.report.js";

export const getPartyStatement = async (req, res, next) => {
  try {
    const db = getDB();

    const data = await partyLedgerStatementReport({
      db,
      partyId: req.params.partyId,
      fromDate: req.query.from ? new Date(req.query.from) : null,
      toDate: req.query.to ? new Date(req.query.to) : null,
      branchId: req.query.branchId || null,
      user: req.user
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};


export const getPartyInvoiceStatement = async (req, res, next) => {
  try {
    const db = getDB();

    const report = await partyInvoiceStatementReport({
      db,
      partyId: req.params.partyId,
      fromDate: req.query.from || null,
      toDate: req.query.to || null,
      branchId: req.query.branchId || null,
      user: req.user
    });

    res.json(report);
  } catch (err) {
    next(err);
  }
};
