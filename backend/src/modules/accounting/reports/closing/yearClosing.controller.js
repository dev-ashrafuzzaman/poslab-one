// modules/accounting/closing/yearClosing.controller.js
import { getDB } from "../../../../config/db.js";
import { yearClosingService } from "./yearClosing.service.js";

export const closeFinancialYear = async (req, res, next) => {
  try {
    const db = getDB();

    const result = await yearClosingService({
      db,
      fiscalYearEndDate: new Date(req.body.fiscalYearEndDate),
      retainedEarningsAccountId: req.accounts.RETAINED_EARNINGS,
      branchId: req.body.branchId || null
    });

    res.json({
      success: true,
      message: "Financial year closed successfully",
      data: result
    });
  } catch (err) {
    next(err);
  }
};
