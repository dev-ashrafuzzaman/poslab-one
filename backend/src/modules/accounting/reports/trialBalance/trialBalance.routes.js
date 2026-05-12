// modules/accounting/reports/trialBalance.routes.js
import { Router } from "express";
import { authenticate } from "../../../../middlewares/auth.middleware.js";
import { getTrialBalance } from "./trialBalance.controller.js";

const router = Router();

router.use(authenticate);

router.get("/",  getTrialBalance);

export default router;
// GET /api/accounting/reports/trial-balance?from=2026-01-01&to=2026-01-31
