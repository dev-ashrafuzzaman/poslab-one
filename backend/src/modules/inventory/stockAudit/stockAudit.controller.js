import withTransaction from "../../../utils/withTransaction.js";
import * as service from "./stockAudit.service.js";
import { getAuditReport } from "./stockAudit.service.js";

/* ===============================
   CREATE AUDIT
================================ */
export const createAuditCtrl = async (req, res) => {
  try {
    const audit = await withTransaction((session) =>
      service.createAudit(req.body.branchId, req.user._id, session)
    );
    res.json(audit);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/* ===============================
   GET AUDIT (RESUME)
================================ */
export const getAuditCtrl = async (req, res) => {
  try {
    const data = await service.getAudit(req.params.auditId);
    res.json(data);
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};

/* ===============================
   SCAN SKU  ✅ FIXED
================================ */
export const scanItemCtrl = async (req, res) => {
  try {
    const item = await withTransaction((session) =>
      service.scanItem(
        req.params.auditId,
        req.body.sku,
        session
      )
    );

    // 🔥 ERP-grade delta response
    res.json({ item });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/* ===============================
   SUBMIT AUDIT
================================ */
export const submitAuditCtrl = async (req, res) => {
  try {
    const result = await withTransaction((session) =>
      service.submitAudit(req.params.auditId, req.user._id, session)
    );
    res.json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


export const getAuditReportCtrl = async (req, res) => {
  try {
    const report = await getAuditReport(req.params.auditId);
    res.json(report);
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};