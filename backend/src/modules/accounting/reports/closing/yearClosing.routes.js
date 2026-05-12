// modules/accounting/closing/yearClosing.routes.js
import { Router } from "express";
import { authenticate } from "../../../../middlewares/auth.middleware.js";

import { closeFinancialYear } from "./yearClosing.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  closeFinancialYear,
);

export default router;

// {
//   "fiscalYearEndDate": "2026-06-30",
//   "branchId": null
// }
