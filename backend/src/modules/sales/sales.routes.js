import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  reprintSale,
  reprintSaleByInvoice,
  reprintSalesReturn,
} from "./reprint/sales.reprint.controller.js";

import { beforeCreateSale } from "./sales.hook.js";
import { createSale } from "./sales.controller.js";
import { getPaymentMethods, getSingleSale } from "./sales.service.js";
import { getAll } from "../../controllers/base.controller.js";
import { createSalesReturn } from "./return/salesReturn.controller.js";
import { getSalesReturns } from "./return/salesReturn.service.js";
import { salesReportController } from "./salesReport/salesReport.controller.js";

const router = Router();

router.use(authenticate);

router.post("/reports", salesReportController);
router.post("/", beforeCreateSale, createSale);
router.get("/:saleId/reprint", reprintSale);
router.get(
  "/",
  getAll({
    collection: "sales",
    searchableFields: ["name", "invoiceNo"],
    filterableFields: ["status", "type"],
  }),
);
router.get(
  "/commissions",
  getAll({
    collection: "commission_ledgers",
    searchableFields: ["narration", "invoiceNo"],
    filterableFields: ["status", "payoutStatus"],
  }),
);
router.get("/reprint/:invoiceNo", reprintSaleByInvoice);
router.get("/payment-methods", getPaymentMethods);

// Retrun
router.get("/:saleId/return", getSingleSale);
router.post("/:saleId/return", createSalesReturn);
router.get("/returns", getSalesReturns);

router.get("/return/:salesReturnId", reprintSalesReturn);
export default router;
