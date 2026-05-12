import { ObjectId } from "mongodb";
import { expenseAccounting } from "./expense.accounting.js";
import { resolveBranch } from "../../../utils/resolveBranch.js";
import { roundMoney } from "../../../utils/money.js";

export const createExpenseService = async ({ db, session, payload, user }) => {
  const {
    expenseAccountId,
    category,
    paymentAccountId,
    payment,
    amount,
    description,
    referenceNo,
    expenseDate,
  } = payload;

  const branch = await resolveBranch({ db, user, session });
  const roundedAmount = roundMoney(amount);

  if (roundedAmount <= 0) {
    throw new Error("Invalid expense amount");
  }

  const expenseAcc = await db
    .collection("accounts")
    .findOne({ _id: new ObjectId(expenseAccountId) }, { session });

  if (!expenseAcc || expenseAcc.type !== "EXPENSE") {
    throw new Error("Invalid expense account selected");
  }

  const paymentAcc = await db
    .collection("accounts")
    .findOne({ _id: new ObjectId(paymentAccountId) }, { session });

  if (!paymentAcc || paymentAcc.type !== "ASSET") {
    throw new Error("Invalid payment account selected");
  }

  const expenseDoc = {
    branchId: new ObjectId(branch._id), // ✅ use resolved branch
    expenseAccountId: new ObjectId(expenseAcc._id),
    paymentAccountId: new ObjectId(paymentAcc._id),
    amount: roundedAmount,
    payment,
    category,
    description,
    referenceNo,
    expenseDate: new Date(expenseDate),
    createdBy: new ObjectId(user._id),
    createdAt: new Date(),
    status: "POSTED",
  };

  const res = await db
    .collection("expenses")
    .insertOne(expenseDoc, { session });

  await expenseAccounting({
    db,
    session,
    expenseId: res.insertedId,
    amount: roundedAmount,
    expenseAccountId: expenseAcc._id,
    paymentAccountId: paymentAcc._id,
    branchId: branch._id,
    narration: description,
  });

  return res.insertedId;
};
