// modules/accounting/ledgers/ledgers.collection.js
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../../database/collections.js";

export const insertLedger = async (db, payload) => {
  const doc = {
    accountId: new ObjectId(payload.accountId),
    branchId: payload.branchId ? new ObjectId(payload.branchId) : null,
    debit: parseFloat(payload.debit || 0),
    credit: parseFloat(payload.credit || 0),
    balance: parseFloat(payload.balance || 0),
    refType: payload.refType,
    refId: payload.refId ? new ObjectId(payload.refId) : null,
    narration: payload.narration?.trim() || "",
    partyType: payload.partyType || null,
    partyId: payload.partyId ? new ObjectId(payload.partyId) : null,
    journalId: payload.journalId ? new ObjectId(payload.journalId) : null,
    date: payload.date ? new Date(payload.date) : new Date(),
    voucherNo: payload.voucherNo,
    createdAt: new Date(),
  };

  return db
    .collection(COLLECTIONS.LEDGERS)
    .insertOne(doc, payload.session ? { session: payload.session } : undefined);
};