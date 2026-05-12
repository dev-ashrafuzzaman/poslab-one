import { ObjectId } from "mongodb";
import { getDB } from "../../../config/db.js";
import { roundMoney } from "../../../utils/money.js";
import { getAccountBalance } from "../accounts/accountBalance.service.js";
import { generateCode } from "../../../utils/codeGenerator.js";
import { resolveSystemAccounts } from "../account.resolver.js";
import { postJournalEntry } from "../journals/journals.service.js";
import { buildAccountTransferNarration } from "./accountNarration.js";

export const createAccountTransferService = async ({
  user,
  branchId,
  toBranchId,
  fromAccountId,
  toAccountId,
  amount,
  charge,
  narration,
}) => {
  const db = getDB();
  const session = db.client.startSession();

  try {
    session.startTransaction();

    /* =====================================
       ROLE VALIDATION
    ===================================== */

    if (user.roleName !== "Admin" && user.roleName !== "Super Admin") {
      throw new Error("Only admin can create transfer");
    }

    /* =====================================
       OBJECT ID VALIDATION
    ===================================== */

    const fromBranchObject = new ObjectId(branchId);
    const toBranchObject = new ObjectId(toBranchId);

    const fromAccountObject = new ObjectId(fromAccountId);
    const toAccountObject = new ObjectId(toAccountId);

    /* =====================================
       AMOUNT VALIDATION
    ===================================== */

    const parsedAmount = roundMoney(amount);
    const parsedCharge = roundMoney(charge || 0);

    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Invalid transfer amount");
    }

    const totalDeduct = parsedAmount + parsedCharge;

    /* =====================================
       PREVENT SAME ACCOUNT SAME BRANCH
    ===================================== */

    if (fromAccountId === toAccountId && branchId === toBranchId) {
      throw new Error("Cannot transfer within same account and branch");
    }

    /* =====================================
       BRANCH VALIDATION
    ===================================== */

    const fromBranch = await db
      .collection("branches")
      .findOne({ _id: fromBranchObject }, { session });

    if (!fromBranch) throw new Error("From branch not found");

    const toBranch = await db
      .collection("branches")
      .findOne({ _id: toBranchObject }, { session });

    if (!toBranch) throw new Error("To branch not found");

    /* =====================================
       ACCOUNT VALIDATION
    ===================================== */

    const fromAccount = await db.collection("accounts").findOne(
      {
        _id: fromAccountObject,
        status: "ACTIVE",
      },
      { session },
    );

    if (!fromAccount) {
      throw new Error("From account not found or inactive");
    }

    const toAccount = await db.collection("accounts").findOne(
      {
        _id: toAccountObject,
        status: "ACTIVE",
      },
      { session },
    );

    if (!toAccount) {
      throw new Error("To account not found or inactive");
    }

    /* =====================================
       BALANCE VALIDATION
    ===================================== */

    const balance = await getAccountBalance({
      accountId: fromAccountId,
      branchId,
    });

    if (totalDeduct > balance) {
      throw new Error(`Insufficient balance. Available balance: ${balance}`);
    }

    /* =====================================
       GENERATE TRANSFER CODE
    ===================================== */

    const transferCode = await generateCode({
      db,
      module: "ACCOUNT_TRANSFER",
      prefix: "AT",
      scope: "YEAR",
      branch: fromBranch.code,
      session,
    });

    /* =====================================
       INSERT TRANSFER
    ===================================== */
    const finalNarration = buildAccountTransferNarration({
      fromBranch: fromBranch.name,
      fromAccount: fromAccount.name,
      toBranch: toBranch.name,
      toAccount: toAccount.name,
      amount: parsedAmount,
      charge: parsedCharge,
      userNarration: narration,
    });

    const result = await db.collection("account_transfers").insertOne(
      {
        transferCode,

        fromBranchId: fromBranchObject,
        fromBranchName: fromBranch.name,

        toBranchId: toBranchObject,
        toBranchName: toBranch.name,

        fromAccountId: fromAccountObject,
        fromAccountName: fromAccount.name,

        toAccountId: toAccountObject,
        toAccountName: toAccount.name,

        amount: parsedAmount,
        charge: parsedCharge,
        totalDeduct,
        narration: finalNarration,
        status: "PENDING",
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

export const approveAccountTransferService = async ({ transferId, user }) => {
  const db = getDB();
  const session = db.client.startSession();

  try {
    session.startTransaction();

    const transfer = await db
      .collection("account_transfers")
      .findOne({ _id: new ObjectId(transferId) }, { session });

    if (!transfer) throw new Error("Transfer not found");

    if (transfer.status !== "PENDING")
      throw new Error("Transfer already processed");

    const SYS = await resolveSystemAccounts(db);

    const entries = [
      {
        accountId: transfer.toAccountId,
        debit: transfer.amount,
        branchId: transfer.toBranchId,
      },

      {
        accountId: transfer.fromAccountId,
        credit: transfer.totalDeduct,
        branchId: transfer.fromBranchId,
      },
    ];

    if (transfer.charge > 0) {
      entries.push({
        accountId: SYS.BANK_CHARGE,
        debit: transfer.charge,
        branchId: transfer.fromBranchId,
      });
    }

    await postJournalEntry({
      db,
      session,
      date: new Date(),
      refType: "ACCOUNT_TRANSFER",
      refId: transfer._id,
      narration: `Account Transfer ${transfer.transferCode}`,
      entries,
    });

    await db.collection("account_transfers").updateOne(
      { _id: transfer._id },

      {
        $set: {
          status: "APPROVED",
          approvedBy: user._id,
          approvedAt: new Date(),
        },
      },

      { session },
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
