import { ObjectId } from "mongodb";
import { resolveSystemAccounts } from "../../accounting/account.resolver.js";
import { postJournalEntry } from "../../accounting/journals/journals.service.js";
import { roundMoney } from "../../../utils/money.js";

export const createSalarySheet = async ({
  db,
  session,
  branchId,
  month,
  employees,
  userId,
}) => {
  const branchObjectId = new ObjectId(branchId);
  const sheetId = new ObjectId();
  const SYS = await resolveSystemAccounts(db);

  let totalNet = 0;
  const journalEntries = [];

  /* ===============================
   PREVENT DUPLICATE EMPLOYEE (SAME MONTH)
=============================== */
console.log("INPUT EMP:", employees.map(e => e.employeeId));

const existingEmployees = await db
  .collection("salary_sheet_items")
  .aggregate([
    {
      $lookup: {
        from: "salary_sheets",
        localField: "salarySheetId",
        foreignField: "_id",
        as: "sheet",
      },
    },
    { $unwind: "$sheet" },
    {
      $match: {
        "sheet.month": month,
        "sheet.branchId": branchObjectId,
      },
    },
    {
      $group: {
        _id: null,
        employeeIds: { $addToSet: "$employeeId" },
      },
    },
  ], { session })
  .toArray();

const existingIds = existingEmployees[0]?.employeeIds || [];

console.log("EXISTING:", existingIds);

/* ===============================
   FILTER NEW EMPLOYEES ONLY
=============================== */

const filteredEmployees = employees.filter(
  (emp) =>
    !existingIds.some((id) =>
      id.equals(new ObjectId(emp.employeeId))
    )
);

console.log("FILTERED:", filteredEmployees);
/* ===============================
   VALIDATION
=============================== */

if (!filteredEmployees.length) {
  throw new Error(
    "All selected employees already have salary for this month"
  );
}


  for (const emp of filteredEmployees) {
    const employee = await db
      .collection("employees")
      .findOne(
        { _id: new ObjectId(emp.employeeId), status: "active" },
        { session },
      );

    const base = roundMoney(employee.payroll?.baseSalary || 0);
    const bonus = roundMoney(emp.bonus || 0);
    const deduction = roundMoney(emp.deduction || 0);

    /* ===== COMMISSION FETCH ===== */

    const commissionAgg = await db
      .collection("commission_ledgers")
      .aggregate(
        [
          {
            $match: {
              employeeId: employee._id,
              branchId: branchObjectId,
              month,
              status: "ACTIVE",
              payoutStatus: "PENDING",
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$commissionAmount" },
              ids: { $push: "$_id" },
            },
          },
        ],
        { session },
      )
      .toArray();

    const commission = roundMoney(commissionAgg[0]?.total || 0);
    const ledgerIds = commissionAgg[0]?.ids || [];

    const net = roundMoney(base + commission + bonus - deduction);
    totalNet += net;

    /* ===============================
       ACCOUNTING ENTRY
    =============================== */

    if (base + bonus - deduction > 0) {
      journalEntries.push({
        accountId: SYS.SALARY_EXPENSE,
        debit: roundMoney(base + bonus - deduction),
      });
    }

    if (commission > 0) {
      journalEntries.push({
        accountId: SYS.COMMISSION_EXPENSE,
        debit: commission,
        partyType: "EMPLOYEE",
        partyId: employee._id,
      });
    }

    journalEntries.push({
      accountId: SYS.SALARY_PAYABLE,
      credit: net,
      partyType: "EMPLOYEE",
      partyId: employee._id,
    });

    /* ===== SAVE ITEM ===== */

    await db.collection("salary_sheet_items").insertOne(
      {
        salarySheetId: sheetId,
        employeeId: employee._id,
        baseSalary: base,
        commissionEarned: commission,
        bonus,
        deduction,
        netSalary: net,
        payableRemaining: net,
        commissionLedgerIds: ledgerIds,
        status: "UNPAID",
        createdAt: new Date(),
      },
      { session },
    );

    /* ===== MARK COMMISSION IN PAYROLL ===== */

    if (ledgerIds.length) {
      await db
        .collection("commission_ledgers")
        .updateMany(
          { _id: { $in: ledgerIds } },
          { $set: { payoutStatus: "IN_PAYROLL" } },
          { session },
        );
    }
  }

  /* ===== POST JOURNAL ===== */

  const journal = await postJournalEntry({
    db,
    session,
    branchId: branchObjectId,
    refType: "SALARY_ACCRUAL",
    refId: sheetId,
    date: new Date(),
    narration: `Salary Sheet ${month}`,
    entries: journalEntries,
  });

  await db.collection("salary_sheets").insertOne(
    {
      _id: sheetId,
      branchId: branchObjectId,
      month,
      totalNet,
      journalId: journal._id,
      status: "POSTED",
      createdBy: new ObjectId(userId),
      createdAt: new Date(),
    },
    { session },
  );

  return sheetId;
};

export const processSalaryPayment = async ({
  db,
  session,
  salarySheetItemId,
  amountPaid,
  paymentAccountId,
  payment,
  userId,
}) => {
  if (!ObjectId.isValid(salarySheetItemId))
    throw new Error("Invalid Salary Item ID");

  if (!ObjectId.isValid(paymentAccountId))
    throw new Error("Invalid Payment Account");

  if (amountPaid <= 0) throw new Error("Invalid payment amount");

  const SYS = await resolveSystemAccounts(db);

  /* ===============================
     FETCH SALARY ITEM
  =============================== */

  const item = await db
    .collection("salary_sheet_items")
    .findOne({ _id: new ObjectId(salarySheetItemId) }, { session });

  if (!item) throw new Error("Salary item not found");

  if (amountPaid > item.payableRemaining)
    throw new Error("Payment exceeds remaining amount");

  /* ===============================
     FETCH SHEET
  =============================== */

  const sheet = await db
    .collection("salary_sheets")
    .findOne({ _id: item.salarySheetId }, { session });

  if (!sheet) throw new Error("Salary sheet not found");

  /* ===============================
     ATOMIC UPDATE (RACE SAFE)
  =============================== */

  const updated = await db.collection("salary_sheet_items").findOneAndUpdate(
    {
      _id: item._id,
      payableRemaining: { $gte: amountPaid },
    },
    {
      $inc: { payableRemaining: -amountPaid },
    },
    {
      session,
      returnDocument: "after",
    },
  );

  if (!updated) throw new Error("Payment failed. Please retry.");

  const newRemaining = updated.payableRemaining;

  const newStatus = newRemaining === 0 ? "PAID" : "PARTIAL";

  await db
    .collection("salary_sheet_items")
    .updateOne({ _id: item._id }, { $set: { status: newStatus } }, { session });

  /* ===============================
     ACCOUNTING ENTRY
  =============================== */

  const journal = await postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "SALARY_PAYMENT",
    refId: item._id,
    narration: `Salary & Commission Payment - ${sheet.month} via ${payment}`,
    branchId: sheet.branchId,
    entries: [
      {
        accountId: SYS.SALARY_PAYABLE,
        debit: amountPaid,
        partyType: "EMPLOYEE",
        partyId: item.employeeId,
      },
      {
        accountId: new ObjectId(paymentAccountId),
        credit: amountPaid,
      },
    ],
  });

  /* ===============================
     COMMISSION LEDGER UPDATE
     (Proportional Update)
  =============================== */

  if (item.commissionLedgerIds?.length) {
    const totalSalary = item.netSalary;
    const commissionPortion = item.commissionEarned || 0;

    if (commissionPortion > 0) {
      const ratio = amountPaid / totalSalary;
      const commissionPaidNow = Math.min(
        commissionPortion,
        roundMoney(commissionPortion * ratio),
      );

      await db.collection("commission_ledgers").updateMany(
        { _id: { $in: item.commissionLedgerIds } },
        {
          $inc: { paidAmount: commissionPaidNow },
          $set: { updatedAt: new Date() },
        },
        { session },
      );

      /* mark fully paid if needed */
      await db.collection("commission_ledgers").updateMany(
        {
          _id: { $in: item.commissionLedgerIds },
          payoutStatus: { $ne: "PAID" },
          $expr: {
            $gte: ["$paidAmount", "$commissionAmount"],
          },
        },
        {
          $set: {
            payoutStatus: "PAID",
            paidAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { session },
      );
    }
  }

  /* ===============================
     SAVE PAYMENT RECORD
  =============================== */

  await db.collection("payroll_payments").insertOne(
    {
      salarySheetId: item.salarySheetId,
      salarySheetItemId: item._id,
      employeeId: item.employeeId,
      branchId: sheet.branchId,
      paymentAccountId: new ObjectId(paymentAccountId),
      payment,
      amountPaid,
      journalId: journal._id,
      createdBy: new ObjectId(userId),
      createdAt: new Date(),
    },
    { session },
  );

  /* ===============================
     AUTO COMPLETE SHEET
  =============================== */

  const remainingCount = await db
    .collection("salary_sheet_items")
    .countDocuments(
      {
        salarySheetId: item.salarySheetId,
        status: { $ne: "PAID" },
      },
      { session },
    );

  if (remainingCount === 0) {
    await db
      .collection("salary_sheets")
      .updateOne(
        { _id: item.salarySheetId },
        { $set: { status: "COMPLETED" } },
        { session },
      );
  }

  return journal._id;
};
