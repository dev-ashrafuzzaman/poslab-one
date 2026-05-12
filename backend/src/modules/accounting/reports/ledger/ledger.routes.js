// modules/accounting/reports/ledger/ledger.routes.js
import { Router } from "express";
import {
  getLedger,
  getLedgerSummary,
  getLedgerAging
} from "./ledger.controller.js";
import { authenticate } from "../../../../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticate);

router.get("/:accountId", getLedger);

router.post("/summary", getLedgerSummary);

router.get("/:accountId/aging", getLedgerAging);

export default router;
