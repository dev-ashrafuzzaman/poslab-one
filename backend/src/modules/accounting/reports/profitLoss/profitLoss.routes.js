// modules/accounting/reports/profitLoss.routes.js
import { Router } from "express";
import { getAdvancedProfitLoss, getCashFlow, getProfitLoss } from "./profitLoss.controller.js";
import { authenticate } from "../../../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get(
  "/profit-loss",
  getProfitLoss
);
router.get(
  "/advanced",
  getAdvancedProfitLoss
);

router.get(
  "/cash-flow",
  getCashFlow
);


export default router;
// GET /api/accounting/reports/profit-loss?from=2026-01-01&to=2026-01-31
// /reports/profit-loss-advanced
// ?from=2026-01-01&to=2026-01-31
// &compareFrom=2025-01-01&compareTo=2025-01-31
