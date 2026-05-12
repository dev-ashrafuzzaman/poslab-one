import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../database/collections.js";
import { getDB } from "../../../config/db.js";

export const beforeGenerateSalary = async (req, res, next) => {
  try {
    const db = getDB();
    const { branchId, month } = req.body;

    const branch = await db
      .collection(COLLECTIONS.BRANCHES)
      .findOne({
        _id: new ObjectId(branchId),
        status: "active",
      });

    if (!branch) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch",
      });
    }

    const [year, m] = month.split("-");
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 0, 23, 59, 59);

    req.payrollContext = {
      branch,
      start,
      end,
      totalDays: end.getDate(),
    };

    next();
  } catch (err) {
    next(err);
  }
};
