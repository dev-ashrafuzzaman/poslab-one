// modules/accounting/ledgers/ledgers.collection.js
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../../database/collections.js";

export const insertLedger = async (db, payload) => {
  const doc = {
    accountId: new ObjectId(payload.accountId),
    branchId: payload.branchId ? new ObjectId(payload.branchId) : null,

    debit: payload.debit || 0,
    credit: payload.credit || 0,
    balance: payload.balance,

    refType: payload.refType,
    refId: payload.refId ? new ObjectId(payload.refId) : null,
    narration: payload.narration,

    partyType: payload.partyType || null,
    partyId: payload.partyId ? new ObjectId(payload.partyId) : null,

    journalId: payload.journalId ? new ObjectId(payload.journalId) : null,

    date: payload.date,
    voucherNo: payload.voucherNo,
    createdAt: new Date(),
  };

  return db
    .collection(COLLECTIONS.LEDGERS)
    .insertOne(doc, payload.session ? { session: payload.session } : undefined);
};
