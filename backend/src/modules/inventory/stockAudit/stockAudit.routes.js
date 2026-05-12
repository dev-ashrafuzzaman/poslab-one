import { Router } from "express";
import {
  createAuditCtrl,
  getAuditCtrl,
  getAuditReportCtrl,
  scanItemCtrl,
  submitAuditCtrl
} from "./stockAudit.controller.js";
import { getAll } from "../../../controllers/base.controller.js";

const router = Router();

// create audit
router.post("/",  createAuditCtrl);

router.get(
  "/",
  getAll({
    collection: "stock_audits",
    searchableFields: ["auditNo", "branchName", "status"],
    filterableFields: ["status","startedAt"],
  }),
);



// get single audit (resume / view)
router.get("/:auditId",  getAuditCtrl);

// scan sku
router.post("/:auditId/scan",  scanItemCtrl);

// submit audit
router.post("/:auditId/submit",  submitAuditCtrl);

router.get("/:auditId/report",  getAuditReportCtrl);

export default router;
