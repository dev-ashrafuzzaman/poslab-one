import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { getActivityLogs } from "./admin.controller.js";

const router = Router();

/**
 * GET /activities
 * Filters:
 * - search
 * - action
 * - refType
 * - userId
 * - branchId
 * - dateFrom
 * - dateTo
 * - page, limit
 */
router.get(
  "/",
  authenticate,
  getActivityLogs
);

export default router;
