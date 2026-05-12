// src/modules/system/autoConsolidate.service.js

import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../database/collections.js";

export const autoConsolidateToMain = async ({
  db,
  mainBranchId,
}) => {

  const session = db.client.startSession();

  try {
    session.startTransaction();

    const mainId = new ObjectId(mainBranchId);

    /* 🔒 Block if pending transfer exists */
    const pending = await db.collection("stock_transfers")
      .findOne({ status: "PENDING" });

    if (pending) {
      throw new Error("Pending transfer exists. Abort.");
    }

    /* 1️⃣ Get all non-main stock */
    const stocks = await db.collection(COLLECTIONS.STOCKS)
      .find({
        branchId: { $ne: mainId },
        qty: { $gt: 0 },
      })
      .toArray();

    if (!stocks.length) {
      console.log("No stock to consolidate.");
      await session.commitTransaction();
      return;
    }

    const grouped = {};

    for (const s of stocks) {
      const key = s.branchId.toString();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        variantId: s.variantId,
        qty: s.qty,
      });
    }

    /* 2️⃣ Transfer branch by branch */
    for (const [fromBranchId, items] of Object.entries(grouped)) {

      const transfer = await createStockTransferInternal({
        db,
        session,
        fromBranchId: new ObjectId(fromBranchId),
        toBranchId: mainId,
        items,
      });

      await receiveStockTransferInternal({
        db,
        session,
        transferId: transfer.transferId,
      });
    }

    await session.commitTransaction();

    console.log("✅ Consolidation completed.");

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
};