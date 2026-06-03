// modules/accounting/journals/journals.service.js
import { ObjectId } from "mongodb";
import { insertJournal } from "./journals.collection.js";
import { insertLedger } from "../ledgers/ledgers.collection.js";
import { validateJournalBusinessRules } from "./journals.rules.js";
import { generateCode } from "../../../utils/codeGenerator.js";
import { COLLECTIONS } from "../../../database/collections.js";

/**
 * Enterprise Double-Entry Ledger Orchestrator.
 * Thread-safe transaction implementation preserving historical integrity metrics and atomic balances.
 */
export const postJournalEntry = async ({
  db,
  session,
  date,
  refType,
  refId,
  narration,
  entries,
  branchId = null,
}) => {
  // 1. Force structural code validation for ALL incoming operational traffic logs
  const { totalDebit, totalCredit } = validateJournalBusinessRules(entries);

  /* ===================================================
     2. BRANCH REFERENCE COERCION
     =================================================== */
  let branchCode = null;
  let targetBranchObjectId = null;

  if (branchId) {
    targetBranchObjectId = new ObjectId(branchId);
    const branch = await db
      .collection("branches")
      .findOne({ _id: targetBranchObjectId }, { session, projection: { code: 1 } });

    if (!branch) {
      throw new Error(`[Reference Integrity Error] Target branch context not found for ID: ${branchId}`);
    }
    branchCode = branch.code;
  }

  // 3. Generate Sequential Protected Unique Audit Voucher Reference Key
  const voucherNo = await generateCode({
    db,
    module: "JOURNAL",
    prefix: "JV",
    scope: "YEAR",
    branch: branchCode, 
    padding: 10,
    session,
  });

  // 4. Extract clean mapping payload elements to bypass dirty string injection traps
  const normalizedEntries = entries.map(e => ({
    accountId: new ObjectId(e.accountId),
    debit: parseFloat(parseFloat(e.debit || 0).toFixed(2)),
    credit: parseFloat(parseFloat(e.credit || 0).toFixed(2)),
    partyType: e.partyType ? e.partyType.toLowerCase().trim() : null,
    partyId: e.partyId ? new ObjectId(e.partyId) : null,
    partyCode: e.partyCode || null
  }));

  // 5. Commit Master Journal Voucher Header Snapshot Document
  const journalRes = await insertJournal(db, {
    voucherNo,
    date: date ? new Date(date) : new Date(),
    refType: refType?.toUpperCase().trim(),
    refId: refId ? new ObjectId(refId) : null,
    narration: narration?.trim() || "",
    entries: normalizedEntries,
    totalDebit,
    totalCredit,
    branchId: targetBranchObjectId,
    session,
  });

  const journalId = journalRes.insertedId;

  /* ===================================================
     6. SEQUENTIAL ACCUMULATION & RUNNING BALANCE POSTING
     =================================================== */
  for (const e of normalizedEntries) {
    const entryBranchId = e.branchId ? new ObjectId(e.branchId) : targetBranchObjectId;

    // 🔥 Ultra Fix: Strict sorting chain matching the exact compound index order to avoid RAM sort penalty
    const lastLedger = await db.collection(COLLECTIONS.LEDGERS).findOne(
      {
        accountId: e.accountId,
        branchId: entryBranchId,
      },
      {
        sort: { accountId: 1, branchId: 1, date: -1, createdAt: -1, _id: -1 }, 
        session,
        projection: { balance: 1 }, 
      }
    );

    const lastBalance = lastLedger?.balance ?? 0;

    // Calculate precision dynamic incremental margin movement rules
    const netChange = e.debit - e.credit;
    const computedBalance = parseFloat((lastBalance + netChange).toFixed(2));

    // 7. Insert Sub-ledger row line elements smoothly inside transactional context
    await insertLedger(db, {
      accountId: e.accountId,
      debit: e.debit,
      credit: e.credit,
      balance: computedBalance,
      refType: refType?.toUpperCase().trim(),
      refId,
      narration,
      date: date ? new Date(date) : new Date(), 
      branchId: entryBranchId, 
      partyType: e.partyType,
      partyId: e.partyId,
      journalId,
      voucherNo,
      session,
    });
  }

  return {
    _id: journalId,
    voucherNo,
    totalDebit,
    totalCredit,
  };
};

export const createJournalService = async ({ db, payload, session }) => {
  // Invokes posting pipe natively which encapsulates business rules processing automatically
  await postJournalEntry({
    db,
    session,
    date: payload.date,
    refType: payload.refType || "MANUAL",
    refId: payload.refId,
    narration: payload.narration,
    branchId: payload.branchId,
    entries: payload.entries,
  });

  return true;
};