import { getDB } from "../../config/db.js";
import { resolveDateRange } from "../../utils/dateRange.js";
import { getDashboardService } from "./dashboard.service.js";

export const getDashboard = async (req, res, next) => {
  try {
    const { branchId, range } = req.query;

    const { from, to } = resolveDateRange(range || "today");
    const data = await getDashboardService({
      db: getDB(),
      branchId,
      from,
      to,
    });

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};