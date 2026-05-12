import { ObjectId } from "mongodb";
import { getDB } from "../../../config/db.js";

export const getEmployeesWithCommission = async (req, res, next) => {
  try {
    const db = getDB();

    let { branchId, month } = req.query;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: "Month is required",
      });
    }

    /* 🔒 Branch Security */
    if (req.user.branchId) {
      branchId = req.user.branchId;
    }

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "Branch is required",
      });
    }

    const branchObjectId = new ObjectId(branchId);

    const employees = await db.collection("employees").aggregate([

      /* ===============================
         MATCH ACTIVE EMPLOYEES
      =============================== */

      {
        $match: {
          branchId: branchObjectId,
          status: "active",
        },
      },

      /* ===============================
         LOOKUP COMMISSION LEDGERS
      =============================== */

      {
        $lookup: {
          from: "commission_ledgers",
          let: { empId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$employeeId", "$$empId"] },
                    { $eq: ["$month", month] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                earned: { $sum: "$earnedAmount" },
                reversed: { $sum: "$reversedAmount" },
                paid: { $sum: "$paidAmount" },
                net: { $sum: "$netCommission" },
              },
            },
          ],
          as: "commissionData",
        },
      },

      /* ===============================
         CLEAN STRUCTURE
      =============================== */

      {
        $addFields: {
          commission: {
            $ifNull: [
              { $arrayElemAt: ["$commissionData", 0] },
              {
                earned: 0,
                reversed: 0,
                paid: 0,
                net: 0,
              },
            ],
          },
        },
      },

      {
        $project: {
          name: 1,
          code: 1,
          role: 1,
          designation: 1,
          payroll: 1,
          commission: 1,
        },
      },

      {
        $sort: { name: 1 },
      },

    ]).toArray();

    return res.json({
      success: true,
      data: employees,
    });

  } catch (err) {
    next(err);
  }
};