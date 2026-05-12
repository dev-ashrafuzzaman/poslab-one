import { ObjectId } from "mongodb";
import { getDB } from "../../config/db.js";
import { openingBalanceAccounting } from "./accounting.adapter.js";

export const createOpeningBalance = async (req, res, next) => {
  const db = getDB();
  const session = db.client.startSession();


  try {

    const { openingDate, amount, branchId } = req.body;

    await session.withTransaction(async () => {
      // ❌ Prevent duplicate opening balance
      const exists = await db
        .collection("journals")
        .findOne({ refType: "OPENING_BALANCE", branchId: new ObjectId(branchId) }, { session });

      if (exists) {
        throw new Error("Opening balance already exists for this branch");
      }

      await db.collection("settings").updateOne(
        { key: "OPENING_BALANCE_LOCK", branchId: new ObjectId(branchId) },
        {
          $set: {
            value: true,
            lockedAt: new Date(),
          },
        },
        { upsert: true, session },
      );

      await openingBalanceAccounting({
        db,
        session,
        openingDate: new Date(openingDate),
        amount,
        branchId: new ObjectId(branchId)
      });
    });

    res.status(201).json({
      success: true,
      message: "Opening balance created successfully",
    });
  } catch (err) {
    next(err);
  } finally {
    await session.endSession();
  }
};

export const getOpeningBalanceStatus = async (req, res, next) => {
  try {
    const db = getDB();
    const { branchId } = req.query;
    const lock = await db.collection("settings").findOne({
      key: "OPENING_BALANCE_LOCK",
     branchId: new ObjectId(branchId)
    });

    res.json({
      locked: !!lock?.value,
      lockedAt: lock?.lockedAt || null,
    });
  } catch (err) {
    next(err);
  }
};
