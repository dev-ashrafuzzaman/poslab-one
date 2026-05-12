import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { smartAttendance } from "./attendance.smart.controller.js";
import { attendanceReport } from "./attendance.report.controller.js";

const router = Router();
router.use(authenticate);

router.post(
  "/today",
  smartAttendance,
);

router.get(
  "/",
  attendanceReport,
);

export default router;

/**
 * ============================
 * Attendance Dynamic Report API
 * ============================
 *
 * Endpoint:
 * GET /api/attendance/report
 *
 * Purpose:
 * - Dynamic attendance reporting for ERP system
 * - Supports summary & details view
 * - Human-readable employee & branch data attached
 *
 * ----------------------------
 * Query Parameters (Dynamic)
 * ----------------------------
 *
 * @query from (string | optional)
 *    - Start date (YYYY-MM-DD)
 *    - Example: from=2026-01-01
 *
 * @query to (string | optional)
 *    - End date (YYYY-MM-DD)
 *    - Example: to=2026-01-31
 *
 * @query branchId (string | optional)
 *    - Filter by branch
 *    - MongoDB ObjectId of branch
 *
 * @query employeeId (string | optional)
 *    - Filter by specific employee
 *    - MongoDB ObjectId of employee
 *
 * @query status (string | optional)
 *    - Attendance status filter
 *    - Allowed values: present | late | absent | leave
 *
 * @query view (string | optional)
 *    - Report type
 *    - summary → grouped employee-wise report
 *    - details → daily attendance list
 *    - Default: summary
 *
 * @query page (number | optional)
 *    - Page number for pagination (details view only)
 *    - Default: 1
 *
 * @query limit (number | optional)
 *    - Records per page (details view only)
 *    - Default: 20
 *
 * ----------------------------
 * Response Behavior
 * ----------------------------
 *
 * view = summary
 *  - Returns employee-wise aggregated attendance
 *  - Includes employee & branch human-readable info
 *
 * view = details
 *  - Returns date-wise attendance records
 *  - Includes punch-in, punch-out, working minutes
 *  - Paginated response
 *
 * ----------------------------
 * ERP Notes
 * ----------------------------
 * - One attendance per employee per day
 * - Salary & payroll ready
 * - Frontend does NOT need extra employee/branch API calls
 * - Scalable for large datasets
 */
