import { ObjectId } from "mongodb";
import { insertJournal } from "./journals.collection.js";
import { insertLedger } from "../ledgers/ledgers.collection.js";
import { validateJournalBusinessRules } from "./journals.rules.js";
import { generateCode } from "../../../utils/codeGenerator.js";
import { COLLECTIONS } from "../../../database/collections.js";

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
  let totalDebit = 0;
  let totalCredit = 0;

  for (const e of entries) {
    totalDebit += e.debit || 0;
    totalCredit += e.credit || 0;
  }

  if (totalDebit !== totalCredit) {
    throw new Error("Debit & Credit mismatch");
  }

  /* ======================
     2. BRANCH LOOKUP
  ====================== */
  let branchCode = null;

  if (branchId) {
    const branch = await db
      .collection("branches")
      .findOne({ _id: new ObjectId(branchId) }, { session });

    if (!branch) {
      throw new Error("Branch not found");
    }

    // assuming branch.code = "DHK" / "CTG"
    branchCode = branch.code;
  }
  const voucherNo = await generateCode({
    db,
    module: "JOURNAL",
    prefix: "JV",
    scope: "YEAR",
    branch: branchCode, // DHK | CTG
    padding: 10,
    session,
  });

  const journalRes = await insertJournal(db, {
    voucherNo,
    date,
    refType,
    refId,
    narration,
    entries,
    totalDebit,
    totalCredit,
    branchId,
    session,
  });

  const journalId = journalRes.insertedId;

  for (const e of entries) {
    /* =========================
     1️⃣ Resolve Branch Properly
  ========================== */
    const entryBranchId = e.branchId
      ? new ObjectId(e.branchId)
      : branchId
        ? new ObjectId(branchId)
        : null;

    /* =========================
     2️⃣ Fetch Last Ledger Entry (Optimized)
     Using findOne with sort (no cursor)
  ========================== */
    const lastLedger = await db.collection(COLLECTIONS.LEDGERS).findOne(
      {
        accountId: new ObjectId(e.accountId),
        branchId: entryBranchId,
      },
      {
        sort: { date: -1, createdAt: -1 },
        session,
        projection: { balance: 1 }, // ⚡ only what we need
      },
    );

    const lastBalance = lastLedger?.balance ?? 0;

    /* =========================
     3️⃣ Compute New Balance
  ========================== */
    const balance =
      lastBalance + (Number(e.debit) || 0) - (Number(e.credit) || 0);

    /* =========================
     4️⃣ Insert Ledger
  ========================== */
    await insertLedger(db, {
      accountId: e.accountId,
      debit: Number(e.debit) || 0,
      credit: Number(e.credit) || 0,
      balance,

      refType,
      refId,
      narration,
      date: date || new Date(), // ⚠ never allow null
      branchId: entryBranchId, // ✅ CRITICAL FIX

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
  const { entries } = payload;

  // 🔥 REAL validation
  const { totalDebit, totalCredit } = validateJournalBusinessRules(entries);

  await postJournalEntry({
    db,
    session,
    date: payload.date,
    refType: payload.refType,
    refId: payload.refId,
    narration: payload.narration,
    branchId: payload.branchId,
    entries,
    totalDebit,
    totalCredit,
  });

  return true;
};
