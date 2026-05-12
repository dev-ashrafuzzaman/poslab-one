import { ObjectId } from "mongodb";
import { getDB } from "../../../config/db.js";
import { expenseSchema } from "./expense.schema.js";
import { createExpenseService } from "./expense.service.js";

export const createExpense = async (req, res, next) => {
  const db = getDB();
  const session = db.client.startSession();

  try {
    const { error } = expenseSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(422).json({
        message: "Validation Error",
        errors: error.details.map((d) => d.message),
      });
    }

    await session.withTransaction(async () => {
      await createExpenseService({
        db,
        session,
        payload: req.body,
        user: req.user,
      });
    });

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
    });
  } catch (err) {
    next(err);
  } finally {
    await session.endSession();
  }
};


export const getExpenseReport = async (req, res, next) => {

  try {

    const db = getDB();

    const { startDate, endDate, branchId } = req.query;

    const userBranch = req.user.branchId;

    const selectedBranch = branchId || userBranch;

    const pipeline = [

      {
        $match: {
          branchId: new ObjectId(selectedBranch),
          status: "POSTED",
          expenseDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },

      {
        $facet: {

          /* ---------------- Expense List ---------------- */

          expenses: [
            {
              $project: {
                expenseDate: 1,
                category: 1,
                payment: 1,
                amount: 1,
                referenceNo: 1,
                description: 1
              }
            },
            { $sort: { expenseDate: -1 } }
          ],

          /* ---------------- Summary ---------------- */

          summary: [
            {
              $group: {
                _id: null,
                totalExpense: { $sum: "$amount" },
                totalTransactions: { $sum: 1 }
              }
            },
            { $project: { _id: 0 } }
          ],

          /* ---------------- Category Summary ---------------- */

          categorySummary: [
            {
              $group: {
                _id: "$category",
                total: { $sum: "$amount" }
              }
            },
            {
              $project: {
                _id: 0,
                category: "$_id",
                total: 1
              }
            },
            { $sort: { total: -1 } }
          ],

          /* ---------------- Payment Summary ---------------- */

          paymentSummary: [
            {
              $group: {
                _id: "$payment",
                total: { $sum: "$amount" }
              }
            },
            {
              $project: {
                _id: 0,
                payment: "$_id",
                total: 1
              }
            },
            { $sort: { total: -1 } }
          ]

        }
      }

    ];

    const result = await db
      .collection("expenses")
      .aggregate(pipeline)
      .toArray();

    res.json({
      success: true,
      ...result[0]
    });

  } catch (error) {
    next(error);
  }

};