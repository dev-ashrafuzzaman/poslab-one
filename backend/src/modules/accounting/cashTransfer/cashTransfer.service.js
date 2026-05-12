import { ObjectId } from "mongodb";
import { generateCode } from "../../../utils/codeGenerator.js";
import { resolveSystemAccounts } from "../account.resolver.js";
import { postJournalEntry } from "../journals/journals.service.js";
import { getDB } from "../../../config/db.js";
import { roundMoney } from "../../../utils/money.js";

/* ============================================================
   CREATE CASH TRANSFER (NO LEDGER ENTRY HERE)
============================================================ */
export const createCashTransferService = async ({
  user,
  amount,
  narration,
  toBranchId = null,
}) => {
  const db = getDB();
  const session = db.client.startSession();

  try {
    session.startTransaction();

    const parsedAmount = roundMoney(amount);

    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0)
      throw new Error("Invalid amount");

    /* =========================
       FROM BRANCH
    ========================== */
    const fromBranch = await db
      .collection("branches")
      .findOne({ _id: new ObjectId(user.branchId) }, { session });

    if (!fromBranch) throw new Error("User branch not found");

    /* =========================
       DESTINATION BRANCH
    ========================== */
    let toBranch;

    if (toBranchId) {
      toBranch = await db
        .collection("branches")
        .findOne({ _id: new ObjectId(toBranchId) }, { session });
    } else {
      toBranch = await db
        .collection("branches")
        .findOne({ isMain: true }, { session });
    }

    if (!toBranch) throw new Error("Destination branch not found");

    /* =========================
       BUSINESS RULE VALIDATION
    ========================== */
    if (!fromBranch.isMain && !toBranch.isMain)
      throw new Error("Branch can transfer only to Main");

    if (fromBranch.isMain && toBranch.isMain)
      throw new Error("Main cannot transfer to itself");

    /* =========================
       CASH VALIDATION
    ========================== */

    const SYS = await resolveSystemAccounts(db);

    // Ledger balance
    const ledgerResult = await db
      .collection("ledgers")
      .aggregate(
        [
          {
            $match: {
              accountId: SYS.CASH,
              branchId: fromBranch._id,
            },
          },
          {
            $group: {
              _id: null,
              totalDebit: { $sum: "$debit" },
              totalCredit: { $sum: "$credit" },
            },
          },
        ],
        { session },
      )
      .toArray();

    const ledgerBalance = ledgerResult.length
      ? ledgerResult[0].totalDebit - ledgerResult[0].totalCredit
      : 0;

    // Pending transfers
    const pendingResult = await db
      .collection("cash_transfers")
      .aggregate(
        [
          {
            $match: {
              fromBranchId: fromBranch._id,
              status: "PENDING",
            },
          },
          {
            $group: {
              _id: null,
              totalPending: { $sum: "$amount" },
            },
          },
        ],
        { session },
      )
      .toArray();

    const pendingAmount = pendingResult.length
      ? pendingResult[0].totalPending
      : 0;

    const availableCash = ledgerBalance - pendingAmount;

    if (parsedAmount > availableCash)
      throw new Error(`Insufficient cash. Available: ${availableCash}`);

    /* =========================
       GENERATE TRANSFER CODE
    ========================== */
    const transferCode = await generateCode({
      db,
      module: "CASH_TRANSFER",
      prefix: "CT",
      scope: "YEAR",
      branch: fromBranch.code,
      session,
    });

    const result = await db.collection("cash_transfers").insertOne(
      {
        transferCode,
        fromBranchId: fromBranch._id,
        fromBranchName: fromBranch.name,
        toBranchId: toBranch._id,
        toBranchName: toBranch.name,
        amount: parsedAmount,
        status: "PENDING",
        narration: narration || "Branch to Accounts Cash Transfer",
        createdBy: new ObjectId(user._id),
        createdByName: user.name,
        createdAt: new Date(),
      },
      { session },
    );

    await session.commitTransaction();
    return result.insertedId;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const receiveCashTransferService = async ({ transferId, user }) => {
  const db = getDB();
  const session = db.client.startSession();

  try {
    session.startTransaction();

    const transfer = await db
      .collection("cash_transfers")
      .findOne({ _id: new ObjectId(transferId) }, { session });

    if (!transfer) throw new Error("Transfer not found");

    if (transfer.status !== "PENDING")
      throw new Error("Transfer already processed");

    const allowedRoles = ["Manager", "Accountant", "Admin"];

    if (!allowedRoles.includes(user.roleName)) {
      throw new Error("Unauthorized role");
    }

    /* =========================
       🔐 BRANCH VALIDATION
    ========================== */

    if (!transfer.toBranchId.equals(new ObjectId(user.branchId))) {
      throw new Error("You are not allowed to receive this transfer");
    }

    const SYS = await resolveSystemAccounts(db);

    /* =========================
       FINAL JOURNAL ENTRY
    ========================== */

    await postJournalEntry({
      db,
      date: new Date(),
      session,
      branchId: transfer.fromBranchId,
      refType: "CASH_TRANSFER",
      refId: transfer._id,
      narration: `Cash Transfer ${transfer.transferCode}`,
      entries: [
        {
          accountId: SYS.CASH,
          debit: transfer.amount,
          branchId: transfer.toBranchId,
        },
        {
          accountId: SYS.CASH,
          credit: transfer.amount,
          branchId: transfer.fromBranchId,
        },
      ],
    });

    await db.collection("cash_transfers").updateOne(
      { _id: transfer._id },
      {
        $set: {
          status: "RECEIVED",
          receivedBy: user._id,
          receivedAt: new Date(),
        },
      },
      { session },
    );

    await session.commitTransaction();
    return true;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
