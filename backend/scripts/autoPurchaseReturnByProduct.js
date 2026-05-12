import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../src/database/collections.js";
import { generateCode } from "../src/utils/codeGenerator.js";
import { roundMoney } from "../src/utils/money.js";
import { connectDB } from "../src/config/db.js";
import { resolveSystemAccounts } from "../src/modules/accounting/account.resolver.js";
import { postJournalEntry } from "../src/modules/accounting/journals/journals.service.js";

dotenv.config();

(async () => {
  const productIdArg = process.argv[2];

  if (!productIdArg) {
    console.log("Usage:");
    console.log("node scripts/autoPurchaseReturnByProduct.js <productId>");
    process.exit(1);
  }

  const db = await connectDB();
  const session = db.client.startSession();

  try {
    session.startTransaction();

    const productId = new ObjectId(productIdArg);

    /* =====================================================
       1️⃣ MAIN BRANCH
    ===================================================== */
    const mainBranch = await db
      .collection(COLLECTIONS.BRANCHES)
      .findOne({ isMain: true }, { session });

    if (!mainBranch) throw new Error("Main branch not found");

    const branchId = mainBranch._id;

    /* =====================================================
       2️⃣ VARIANTS
    ===================================================== */
    const variants = await db
      .collection(COLLECTIONS.VARIANTS)
      .find({ productId })
      .toArray();

    if (!variants.length) throw new Error("No variants found");

    const variantIds = variants.map((v) => v._id);

    /* =====================================================
       3️⃣ STOCK SNAPSHOT
    ===================================================== */
    const stocks = await db
      .collection(COLLECTIONS.STOCKS)
      .find({
        branchId,
        variantId: { $in: variantIds },
        qty: { $gt: 0 },
      })
      .toArray();

    if (!stocks.length) {
      console.log("No stock available for return");
      await session.abortTransaction();
      process.exit(0);
    }

    /* =====================================================
       4️⃣ RETURN NUMBER
    ===================================================== */
    const returnNo = await generateCode({
      db,
      module: "PURCHASE_RETURN",
      prefix: "PRT",
      scope: "YEAR",
      branch: mainBranch.code,
      session,
    });

    let totalQty = 0;
    let totalAmount = 0;

    const returnItems = [];
    const returnMovements = [];

    /* =====================================================
       5️⃣ FIFO PROCESS
    ===================================================== */
    for (const stock of stocks) {
      const variantId = stock.variantId;
      let remainingQty = stock.qty;

      const layers = await db
        .collection(COLLECTIONS.STOCK_MOVEMENTS)
        .find({
          branchId,
          variantId,
          type: "PURCHASE",
          balanceQty: { $gt: 0 },
        })
        .sort({ createdAt: 1 }) // FIFO
        .toArray();

      if (!layers.length)
        throw new Error(`No FIFO purchase layers found for ${variantId}`);

      for (const layer of layers) {
        if (remainingQty <= 0) break;

        const consumeQty = Math.min(layer.balanceQty, remainingQty);

        /* 🔹 Reduce purchase layer balance */
        await db.collection(COLLECTIONS.STOCK_MOVEMENTS).updateOne(
          { _id: layer._id },
          { $inc: { balanceQty: -consumeQty } },
          { session },
        );

        /* 🔹 Prepare return movement */
        returnMovements.push({
          branchId,
          variantId,
          productId,
          qty: -consumeQty,
          costPrice: layer.costPrice,
        });

        /* 🔹 Snapshot item */
        returnItems.push({
          variantId,
          qty: consumeQty,
          costPrice: layer.costPrice,
        });

        totalQty += consumeQty;
        totalAmount += consumeQty * layer.costPrice;
        remainingQty -= consumeQty;
      }

      if (remainingQty > 0)
        throw new Error("Insufficient FIFO layers to complete return");

      /* 🔹 Update stock snapshot */
      await db.collection(COLLECTIONS.STOCKS).updateOne(
        { _id: stock._id },
        { $set: { qty: 0, updatedAt: new Date() } },
        { session },
      );
    }

    totalAmount = roundMoney(totalAmount);

    /* =====================================================
       6️⃣ INSERT RETURN DOCUMENT
    ===================================================== */
    const insertReturn = await db
      .collection(COLLECTIONS.PURCHASE_RETURNS)
      .insertOne(
        {
          returnNo,
          productId,
          branchId,
          returnDate: new Date(),
          items: returnItems,
          totalQty,
          totalAmount,
          createdAt: new Date(),
        },
        { session },
      );

    /* =====================================================
       7️⃣ INSERT RETURN MOVEMENTS
    ===================================================== */
    for (const movement of returnMovements) {
      await db.collection(COLLECTIONS.STOCK_MOVEMENTS).insertOne(
        {
          ...movement,
          type: "PURCHASE_RETURN",
          balanceQty: 0,
          refType: "PURCHASE_RETURN",
          refId: insertReturn.insertedId,
          createdAt: new Date(),
        },
        { session },
      );
    }

    /* =====================================================
       8️⃣ ACCOUNTING ENTRY
    ===================================================== */
    const SYS = await resolveSystemAccounts(db);

    await postJournalEntry({
      db,
      session,
      date: new Date(),
      refType: "PURCHASE_RETURN",
      refId: insertReturn.insertedId,
      narration: `Purchase Return #${returnNo}`,
      branchId,
      entries: [
        { accountId: SYS.CASH, debit: totalAmount },
        { accountId: SYS.INVENTORY, credit: totalAmount },
      ],
    });

    await session.commitTransaction();

    console.log("🎉 FIFO Purchase Return Completed");
    console.log("Return No:", returnNo);
    console.log("Total Qty:", totalQty);
    console.log("Total Amount:", totalAmount);

    process.exit(0);
  } catch (err) {
    await session.abortTransaction();
    console.error("❌ Error:", err.message);
    process.exit(1);
  } finally {
    await session.endSession();
  }
})();