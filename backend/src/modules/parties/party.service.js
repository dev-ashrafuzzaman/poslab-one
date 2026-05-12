import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../database/collections.js";
import { generateCode } from "../../utils/codeGenerator.js";
import { resolveBranch } from "../../utils/resolveBranch.js";
import { PARTY_CODE_PREFIX } from "./party.constants.js";

export const createParty = async ({ db, payload, user }) => {
  const session = db.client.startSession();

  try {
    return await session.withTransaction(async () => {
      /* ================= BRANCH ================= */

      const branch = await resolveBranch({
        db,
        user,
        session,
      });

      /* ================= EXISTS CHECK ================= */

      const exists = await db.collection(COLLECTIONS.PARTIES).findOne(
        {
          phone: payload.phone,
        },
        { session },
      );

      if (exists) {
        const err = new Error("Party already exists with this phone");
        err.statusCode = 400;
        throw err;
      }

      /* ================= GENERATE CODE ================= */

      const prefix = PARTY_CODE_PREFIX[payload.type] || "PTY";

      const code = await generateCode({
        db,
        module: payload.type.toUpperCase(),
        prefix,
        scope: "YEAR",
        branch: branch.code,
        session,
      });

      /* ================= PASSWORD ================= */

      const defaultPassword = payload.phone?.slice(-6) || "123456";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      /* ================= DOC ================= */

      const doc = {
        code,
        type: payload.type,
        name: payload.name,
        phone: payload.phone || "",
        email: payload.email || "",
        address: payload.address || "",
        openingBalance: payload.openingBalance || 0,
        currentBalance: payload.openingBalance || 0,
        commissionPercent: payload.commissionPercent || 0,
        creditLimit: payload.creditLimit || 0,
        notes: payload.notes || "",
        password: hashedPassword,
        mustChangePassword: true,
        status: payload.status || "active",
        createdBy: {
          id: new ObjectId(user._id),
          name: user.name,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      /* ================= INSERT ================= */

      const result = await db
        .collection(COLLECTIONS.PARTIES)
        .insertOne(doc, { session });

      return {
        ...doc,
        _id: result.insertedId,
        credentials: {
          code,
          password: defaultPassword,
        },
      };
    });
  } finally {
    await session.endSession();
  }
};

export const updateParty = async ({ db, payload, user, partyId }) => {
  const session = db.client.startSession();

  try {
    return await session.withTransaction(async () => {
      /* ================= BRANCH ================= */

      const branch = await resolveBranch({
        db,
        user,
        session,
      });

      /* ================= EXISTING ================= */

      const existing = await db.collection(COLLECTIONS.PARTIES).findOne(
        {
          _id: new ObjectId(partyId),
        },

        { session },
      );

      if (!existing) {
        const err = new Error("Party not found");

        err.statusCode = 404;

        throw err;
      }

      /* ================= REMOVE RESTRICTED ================= */

      delete payload.phone;
      delete payload.code;
      delete payload.password;
      delete payload.currentBalance;
      delete payload.createdBy;
      delete payload.createdAt;

      /* ================= UPDATE ================= */

      const updateDoc = {
        ...payload,

        updatedAt: new Date(),
      };

      await db.collection(COLLECTIONS.PARTIES).updateOne(
        {
          _id: existing._id,
        },
        {
          $set: updateDoc,
        },
        {
          session,
        },
      );

      return {
        ...existing,
        ...updateDoc,
      };
    });
  } finally {
    await session.endSession();
  }
};
