import { Router } from "express";
import {
  createPurchaseReturnController,
  createSupplierPaymentController,
} from "./purchase.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  createPurchase,
  getAllPurchaseReturns,
  getAllPurchases,
  getSinglePurchaseInvoice,
  getSinglePurchaseReturnInvoice,
} from "./purchase.service.js";
import { purchaseCreateSchema } from "./purchase.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(purchaseCreateSchema), createPurchase);
router.post(
  "/supplier-payments",
  createSupplierPaymentController
);
router.post("/return", createPurchaseReturnController);

router.get("/", getAllPurchases);
router.get("/return", getAllPurchaseReturns);
router.get("/:id", getSinglePurchaseInvoice);

router.get("/return/:id", getSinglePurchaseReturnInvoice);

export default router;
