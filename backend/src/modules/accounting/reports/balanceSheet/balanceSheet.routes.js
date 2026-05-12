// modules/accounting/reports/balanceSheet.routes.js
import { Router } from "express";
import { authenticate } from "../../../../middlewares/auth.middleware.js";

import { getBalanceSheet } from "./balanceSheet.controller.js";
import { createOpeningBalance, getOpeningBalanceStatus } from "../../openingBalance.service.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  getBalanceSheet
);
router.post(
  "/opening-balance",
  createOpeningBalance
);
router.get(
  "/opening-balance/status",
  getOpeningBalanceStatus
);

export default router;
// GET /api/accounting/reports/balance-sheet?to=2026-01-31
