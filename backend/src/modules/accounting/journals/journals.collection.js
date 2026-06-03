// modules/accounting/journals/journals.collection.js
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../../database/collections.js";

export const insertJournal = async (db, journal) => {
  const doc = {
    date: journal.date ? new Date(journal.date) : new Date(),
    refType: journal.refType,
    refId: journal.refId ? new ObjectId(journal.refId) : null,
    narration: journal.narration,
    voucherNo: journal.voucherNo,
    branchId: journal.branchId ? new ObjectId(journal.branchId) : null,
    entries: journal.entries, // Received fully normalized array mapping directly from master orchestrator
    totalDebit: journal.totalDebit,
    totalCredit: journal.totalCredit,
    createdAt: new Date(),
  };

  return db
    .collection(COLLECTIONS.JOURNALS)
    .insertOne(doc, journal.session ? { session: journal.session } : undefined);
};