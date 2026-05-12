import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../../database/collections.js";
import { getDB } from "../../../config/db.js";
import {
  formatTime12,
  formatDate,
  formatWorkingTime,
} from "../../../utils/formatMinutes.js";

export const attendanceReport = async (req, res, next) => {
  try {
    const db = getDB();

    const {
      from,
      to,
      branchId,
      employeeId,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const match = {};

    /* date filter */
    if (from && to) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);

      const end = new Date(to);
      end.setHours(23, 59, 59, 999);

      match.date = { $gte: start, $lte: end };
    }

    if (branchId) match.branchId = new ObjectId(branchId);
    if (employeeId) match.employeeId = new ObjectId(employeeId);
    if (status) match.status = status;

    const attendanceCol = db.collection(COLLECTIONS.ATTENDANCES);

    const pipeline = [
      { $match: match },

      /* sort early for better index usage */
      { $sort: { date: -1 } },

      {
        $lookup: {
          from: COLLECTIONS.EMPLOYEES,
          localField: "employeeId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                code: 1,
                name: 1,
              },
            },
          ],
          as: "employee",
        },
      },

      { $unwind: "$employee" },

      {
        $lookup: {
          from: COLLECTIONS.BRANCHES,
          localField: "branchId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "branch",
        },
      },

      { $unwind: "$branch" },

      {
        $project: {
          date: 1,
          punchIn: 1,
          punchOut: 1,
          lateMinutes: { $ifNull: ["$lateMinutes", 0] },
          workingMinutes: { $ifNull: ["$workingMinutes", 0] },
          status: 1,
          employeeCode: "$employee.code",
          employeeName: "$employee.name",
          branchName: "$branch.name",
        },
      },

      { $skip: skip },
      { $limit: limitNum },
    ];

    const data = await attendanceCol.aggregate(pipeline).toArray();

    /* backend formatting (very fast) */
    const formatted = data.map((row) => ({
      ...row,
      date: formatDate(row.date),
      punchIn: formatTime12(row.punchIn),
      punchOut: formatTime12(row.punchOut),
      workingTime: formatWorkingTime(row.workingMinutes),
    }));

    const total = await attendanceCol.countDocuments(match);

    res.json({
      success: true,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
      },
      data: formatted,
    });
  } catch (err) {
    console.error("Attendance Report Error:", err);
    next(err);
  }
};