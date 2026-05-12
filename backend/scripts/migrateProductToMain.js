import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { createStockTransferService, receiveStockTransferService } from "../src/modules/system/transfer.service.js";
import { connectDB } from "../src/config/db.js";

dotenv.config();

(async () => {

  const mainBranchId = process.argv[2];
  const productId = process.argv[3];

  if (!mainBranchId || !productId) {
    console.log("Usage:");
    console.log("node scripts/migrateProductToMain.js <mainBranchId> <productId>");
    process.exit(1);
  }

    const db = await connectDB();
  const session = db.client.startSession();

  try {

    console.log("🔍 Checking pending transfers...");

    const pending = await db.collection("stock_transfers")
      .findOne({ status: "PENDING" });

    if (pending) {
      throw new Error("Pending transfer exists. Resolve first.");
    }

    const pid = new ObjectId(productId);
    const mainId = new ObjectId(mainBranchId);

    console.log("📦 Fetching product variants...");

    /* 1️⃣ Get all variants under product */
    const variants = await db.collection("product_variants")
      .find({ productId: pid })
      .toArray();

    if (!variants.length) {
      throw new Error("No variants found for this product");
    }

    const variantIds = variants.map(v => v._id);

    console.log(`Found ${variantIds.length} variants`);

    /* 2️⃣ Fetch stock for those variants in other branches */
    const stocks = await db.collection("stocks")
      .find({
        branchId: { $ne: mainId },
        variantId: { $in: variantIds },
        qty: { $gt: 0 }
      })
      .toArray();

    if (!stocks.length) {
      console.log("✅ No stock found in other branches.");
      process.exit(0);
    }

    /* 3️⃣ Group by branch */
    const grouped = {};

    for (const s of stocks) {
      const key = s.branchId.toString();
      if (!grouped[key]) grouped[key] = [];

      grouped[key].push({
        variantId: s.variantId,
        qty: s.qty
      });
    }

    console.log("🚀 Starting product-specific migration...");

    session.startTransaction();

    for (const [fromBranchId, items] of Object.entries(grouped)) {

      console.log(`➡ Transferring from branch ${fromBranchId}`);

      const { transferId, transferNo } =
        await createStockTransferService({
          db,
          session,
          fromBranchId,
          toBranchId: mainBranchId,
          items,
          userId: null
        });

      console.log(`   Created transfer ${transferNo}`);

      await receiveStockTransferService({
        db,
        session,
        transferId,
        userId: null
      });

      console.log(`   Received transfer ${transferNo}`);
    }

    await session.commitTransaction();

    console.log("🎉 Product migration completed successfully.");

    process.exit(0);

  } catch (err) {

    await session.abortTransaction();
    console.error("❌ Migration failed:", err.message);
    process.exit(1);

  } finally {
    await session.endSession();
  }

})();