import { ObjectId } from "mongodb";
import { getDB } from "../../../config/db.js";
import {
  createSalarySheet,
  processSalaryPayment,
} from "./payroll.salarySheet.js";

export const createSalarySheetController = async (req, res, next) => {
  const db = getDB();
  const session = db.client.startSession();

  try {
    let { month, employees, branchId } = req.body;

    /* ===============================
       SECURE BRANCH HANDLING
    =============================== */

    if (req.user.branchId) {
      branchId = req.user.branchId;
    }

    if (!branchId) throw new Error("Branch is required");

    if (!month) throw new Error("Month is required");

    if (!employees?.length) throw new Error("No employees selected");

    let sheetId;

    await session.withTransaction(async () => {
      sheetId = await createSalarySheet({
        db,
        session,
        branchId,
        month,
        employees,
        userId: req.user._id,
      });
    });

    session.endSession();

    res.status(201).json({
      success: true,
      sheetId,
    });
  } catch (err) {
    session.endSession();
    next(err);
  }
};

export const paySalaryController = async (req, res, next) => {
  const db = getDB();
  const session = db.client.startSession();

  try {
    const { salarySheetItemId, amount, paymentAccountId, payment } = req.body;

    let journalId;

    await session.withTransaction(async () => {
      journalId = await processSalaryPayment({
        db,
        session,
        salarySheetItemId,
        amountPaid: Number(amount),
        paymentAccountId,
        payment,
        userId: req.user._id,
      });
    });

    session.endSession();

    res.status(201).json({
      success: true,
      journalId,
    });
  } catch (err) {
    session.endSession();
    next(err);
  }
};

export const getSalarySheets = async (req, res, next) => {
  try {
    const db = getDB();
    let { branchId, month } = req.query;

    if (req.user.branchId) {
      branchId = req.user.branchId;
    }

    const filter = {};
    if (branchId) filter.branchId = new ObjectId(branchId);
    if (month) filter.month = month;

    const sheets = await db.collection("salary_sheets")
      .aggregate([
        { $match: filter },

        {
          $lookup: {
            from: "salary_sheet_items",
            localField: "_id",
            foreignField: "salarySheetId",
            as: "items",
          },
        },

        {
          $addFields: {
            totalEmployees: { $size: "$items" },

            totalCommission: {
              $sum: "$items.commissionEarned",
            },

            totalPaid: {
              $sum: {
                $map: {
                  input: "$items",
                  as: "item",
                  in: {
                    $subtract: ["$$item.netSalary", "$$item.payableRemaining"],
                  },
                },
              },
            },

            totalRemaining: {
              $sum: "$items.payableRemaining",
            },
          },
        },

        {
          $project: {
            month: 1,
            status: 1,
            totalNet: 1,
            totalEmployees: 1,
            totalCommission: 1,
            totalPaid: 1,
            totalRemaining: 1,
            createdAt: 1,
          },
        },

        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    res.json({ success: true, data: sheets });

  } catch (err) {
    next(err);
  }
};

export const getSalarySheetDetails = async (req, res, next) => {
  try {
    const db = getDB();
    const { id } = req.params;

    /* ==============================
       1️⃣ VALIDATE OBJECT ID
    ============================== */

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid salary sheet ID",
      });
    }

    const sheetId = new ObjectId(id);

    /* ==============================
       2️⃣ BRANCH SECURITY (RBAC)
    ============================== */

    const match = { _id: sheetId };

    if (req.user.branchId) {
      match.branchId = new ObjectId(req.user.branchId);
    }

    /* ==============================
       3️⃣ FETCH SHEET WITH RELATIONS
    ============================== */

    const sheetAgg = await db
      .collection("salary_sheets")
      .aggregate([
        { $match: match },

        /* -------- Branch -------- */
        {
          $lookup: {
            from: "branches",
            localField: "branchId",
            foreignField: "_id",
            as: "branch",
          },
        },
        { $unwind: "$branch" },

        /* -------- Created By -------- */
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdByUser",
          },
        },
        { $unwind: "$createdByUser" },

        /* -------- Journal -------- */
        {
          $lookup: {
            from: "journals",
            localField: "journalId",
            foreignField: "_id",
            as: "journal",
          },
        },
        {
          $unwind: {
            path: "$journal",
            preserveNullAndEmptyArrays: true,
          },
        },

        /* -------- Salary Items -------- */
        {
          $lookup: {
            from: "salary_sheet_items",
            localField: "_id",
            foreignField: "salarySheetId",
            as: "items",
          },
        },

        /* -------- Paid / Remaining Summary -------- */
        {
          $addFields: {
            totalEmployees: { $size: "$items" },

            totalPaid: {
              $sum: {
                $map: {
                  input: "$items",
                  as: "item",
                  in: {
                    $subtract: ["$$item.netSalary", "$$item.payableRemaining"],
                  },
                },
              },
            },

            totalRemaining: {
              $sum: "$items.payableRemaining",
            },
          },
        },

        /* -------- Clean Projection -------- */
        {
          $project: {
            month: 1,
            status: 1,
            totalNet: 1,
            totalEmployees: 1,
            totalPaid: 1,
            totalRemaining: 1,
            createdAt: 1,

            branch: {
              _id: "$branch._id",
              name: "$branch.name",
              code: "$branch.code",
              address: "$branch.address",
              phone: "$branch.phone",
            },

            createdByUser: {
              _id: "$createdByUser._id",
              name: "$createdByUser.name",
              email: "$createdByUser.email",
            },

            journal: {
              _id: "$journal._id",
              voucherNo: "$journal.voucherNo",
            },

            items: 1,
          },
        },
      ])
      .toArray();

    if (!sheetAgg.length) {
      return res.status(404).json({
        success: false,
        message: "Salary sheet not found",
      });
    }

    const sheet = sheetAgg[0];

/* ==============================
   4️⃣ ENRICH ITEMS WITH EMPLOYEE + COMMISSION
============================== */

const items = await db
  .collection("salary_sheet_items")
  .aggregate([
    { $match: { salarySheetId: sheetId } },

    {
      $lookup: {
        from: "employees",
        localField: "employeeId",
        foreignField: "_id",
        as: "employee",
      },
    },
    { $unwind: "$employee" },

    /* -------- Commission Ledger Lookup -------- */
    {
      $lookup: {
        from: "commission_ledgers",
        localField: "commissionLedgerIds",
        foreignField: "_id",
        as: "commissionLedgers",
      },
    },

    {
      $addFields: {
        commissionEarned: { $ifNull: ["$commissionEarned", 0] },

        commissionPaid: {
          $sum: {
            $ifNull: ["$commissionLedgers.paidAmount", []],
          },
        },
      },
    },

    {
      $addFields: {
        commissionRemaining: {
          $subtract: [
            "$commissionEarned",
            { $sum: "$commissionLedgers.paidAmount" },
          ],
        },
      },
    },

    {
      $project: {
        baseSalary: 1,
        commissionEarned: 1,        // ✅ NEW
        commissionPaid: 1,          // ✅ NEW
        commissionRemaining: 1,     // ✅ NEW
        bonus: 1,
        deduction: 1,
        netSalary: 1,
        payableRemaining: 1,
        status: 1,
        createdAt: 1,

        employee: {
          _id: "$employee._id",
          name: "$employee.name",
          code: "$employee.code",
          role: "$employee.role",
          designation: "$employee.designation",
        },
      },
    },
  ])
  .toArray();

    /* ==============================
       5️⃣ FINAL RESPONSE
    ============================== */

    return res.json({
      success: true,
      data: {
        ...sheet,
        items,
      },
    });
  } catch (err) {
    console.error("SalarySheetDetails Error:", err);
    next(err);
  }
};
