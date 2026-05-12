// modules/accounting/accounts/accounts.routes.js
import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";

import {
  createAccount,
  getAccountBalanceController,
  getAllAccounts,
  getTransactions,
} from "./accounts.controller.js";

import {
  createAccountSchema,
} from "./accounts.validation.js";

import { validate } from "../../../middlewares/validate.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getAllAccounts);
router.get("/:id/balance", getAccountBalanceController);
router.get("/transactions", getTransactions);

router.post("/", validate(createAccountSchema), createAccount);

export default router;
