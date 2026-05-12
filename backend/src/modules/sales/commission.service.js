import { ObjectId } from "mongodb";
import { postJournalEntry } from "../accounting/journals/journals.service.js";
import { resolveSystemAccounts } from "../accounting/account.resolver.js";
import { roundMoney } from "../../utils/money.js";

/* =========================================
   CREATE COMMISSION ON SALE COMPLETE
========================================= */
export const createSaleCommission = async ({
  db,
  session,
  saleId,
  narration,
  salesmanId,
  branchId,
  netAmount,
  saleDate,
}) => {
  if (!salesmanId) return null;

  const employee = await db
    .collection("employees")
    .findOne({ _id: new ObjectId(salesmanId), status: "active" }, { session });

  if (!employee || !employee.payroll?.commissionValue) return null;
console.log("emp commi",employee._id)
  const { commissionType, commissionValue } = employee.payroll;

  let commissionAmount = 0;

  if (commissionType === "percentage") {
    commissionAmount = (netAmount * commissionValue) / 100;
  } else {
    commissionAmount = commissionValue;
  }

  commissionAmount = roundMoney(commissionAmount);
  if (commissionAmount <= 0) return null;

  const month = saleDate.toISOString().slice(0, 7);

  const { insertedId } = await db.collection("commission_ledgers").insertOne(
    {
      employeeId: employee._id,
      branchId,
      saleId,
      narration,
      baseAmount: netAmount,
      commissionRate: commissionValue,
      commissionType,
      commissionAmount,
      earnedAmount: commissionAmount,
      reversedAmount: 0,
      paidAmount: 0,
      netCommission: commissionAmount,
      payoutStatus: "PENDING",
      status: "ACTIVE",
      month,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { session },
  );

  return insertedId;
};

export const reverseCommissionOnReturn = async ({
  db,
  session,
  saleId,
  salesReturnId,
  returnNetAmount,
  originalSaleNet,
  branchId,
  returnDate,
}) => {
  const ledger = await db
    .collection("commission_ledgers")
    .findOne({ saleId: new ObjectId(saleId), status: "ACTIVE" }, { session });

  if (!ledger) return;

  const returnRatio = returnNetAmount / originalSaleNet;
  const reverseAmount = roundMoney(ledger.commissionAmount * returnRatio);

  if (reverseAmount <= 0) return;

  const unpaid = ledger.netCommission - ledger.paidAmount;

  const SYS = await resolveSystemAccounts(db);

  /* =============================
     CASE 1: Reverse from UNPAID
  ============================= */
  if (reverseAmount <= unpaid) {
    await postJournalEntry({
      db,
      session,
      branchId,
      refType: "COMMISSION_RETURN",
      refId: salesReturnId,
      date: returnDate,
      entries: [
        {
          accountId: SYS.COMMISSION_PAYABLE,
          debit: reverseAmount,
          partyId: ledger.employeeId,
          partyType: "EMPLOYEE",
        },
        {
          accountId: SYS.COMMISSION_EXPENSE,
          credit: reverseAmount,
        },
      ],
    });
  } else {
    /* =============================
       CASE 2: Partially Paid or Fully Paid
    ============================= */

    if (unpaid > 0) {
      await postJournalEntry({
        db,
        session,
        branchId,
        refType: "COMMISSION_RETURN",
        refId: salesReturnId,
        date: returnDate,
        entries: [
          {
            accountId: SYS.COMMISSION_PAYABLE,
            debit: unpaid,
            partyId: ledger.employeeId,
            partyType: "EMPLOYEE",
          },
          {
            accountId: SYS.COMMISSION_EXPENSE,
            credit: unpaid,
          },
        ],
      });
    }

    const excess = reverseAmount - unpaid;

    if (excess > 0) {
      await postJournalEntry({
        db,
        session,
        branchId,
        refType: "COMMISSION_ADJUSTMENT",
        refId: salesReturnId,
        date: returnDate,
        entries: [
          {
            accountId: SYS.EMPLOYEE_RECEIVABLE,
            debit: excess,
            partyId: ledger.employeeId,
            partyType: "EMPLOYEE",
          },
          {
            accountId: SYS.COMMISSION_EXPENSE,
            credit: excess,
          },
        ],
      });
    }
  }

  await db.collection("commission_ledgers").updateOne(
    { _id: ledger._id },
    {
      $inc: {
        reversedAmount: reverseAmount,
        netCommission: -reverseAmount,
      },
      $set: {
        updatedAt: new Date(),
      },
    },
    { session },
  );
};

export const calculateSaleCommission = async ({
  db,
  session,
  saleId,
  salesmanId,
  branchId,
  netAmount,
}) => {
  if (!salesmanId) return 0;

  const employee = await db
    .collection("employees")
    .findOne({ _id: new ObjectId(salesmanId), status: "active" }, { session });
  if (!employee) return 0;

  const rule = await db
    .collection("commission_rules")
    .findOne({ appliesTo: "SALE", status: "active" }, { session });
  if (!rule) return 0;

  if (rule.eligibleRoles && !rule.eligibleRoles.includes(employee.role)) {
    return 0;
  }

  /* ---- Base Amount ---- */
  const baseAmount = rule.base === "NET" ? netAmount : netAmount; // future ready

  /* ---- Calculate ---- */
  let commissionAmount = 0;
  if (rule.type === "PERCENT") {
    commissionAmount = (baseAmount * rule.value) / 100;
  } else {
    commissionAmount = rule.value;
  }

  commissionAmount = Number(commissionAmount.toFixed(2));
  if (commissionAmount <= 0) return 0;

  const { insertedId } = await db.collection("commission_ledgers").insertOne(
    {
      employeeId: employee._id,
      saleId,
      branchId,

      baseAmount,
      rate: rule.value,
      commissionAmount,
      status: "EARNED",
      source: "SALE",
      createdAt: new Date(),
    },
    { session },
  );

  return {
    commissionId: insertedId,
    amount: commissionAmount,
  };
};

export const reverseSaleCommission = async ({
  db,
  session,
  saleId,
  salesReturnId,
  returnRatio,
  branchId,
}) => {
  const ledger = await db
    .collection("commission_ledgers")
    .findOne({ saleId, status: "EARNED" }, { session });

  if (!ledger) return 0;

  const reverseAmount = Number(
    (ledger.commissionAmount * returnRatio).toFixed(2),
  );

  if (reverseAmount <= 0) return 0;

  await db.collection("commission_ledgers").insertOne(
    {
      employeeId: ledger.employeeId,
      saleId,
      salesReturnId,
      branchId,
      baseAmount: ledger.baseAmount,
      rate: ledger.rate,
      commissionAmount: -reverseAmount,
      status: "REVERSED",
      source: "SALE_RETURN",
      createdAt: new Date(),
    },
    { session },
  );

  return reverseAmount;
};
