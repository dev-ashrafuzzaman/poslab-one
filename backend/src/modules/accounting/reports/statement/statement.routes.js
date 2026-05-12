// statement.routes.js
import { Router } from "express";
import { getPartyInvoiceStatement, getPartyStatement } from "./statement.controller.js";
import { authenticate } from "../../../../middlewares/auth.middleware.js";


const router = Router();
router.use(authenticate);
/**
 * Universal Ledger Statement
 * GET /api/accounting/reports/statement/:accountId
?from=2026-01-01
&to=2026-01-31
&branchId=xxx
 *
 * GET /api/accounting/reports/statement/:accountId
 */
/**
 * Party Statement
 * Customer / Supplier / Employee
 */
router.get("/party/:partyId", getPartyStatement);
router.get("/party-invoice/:partyId", getPartyInvoiceStatement);


export default router;
