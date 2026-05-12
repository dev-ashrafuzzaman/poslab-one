import { connectDB } from "../src/config/db.js";
import { createSaleCommission } from "../src/modules/sales/commission.service.js";

const runMigration = async () => {
  const db = await connectDB();

  const session = db.client.startSession();

  try {
    await session.withTransaction(async () => {
      const sales = await db
        .collection("sales")
        .find({ status: "COMPLETED" })
        .toArray();

      for (const sale of sales) {
        const exists = await db
          .collection("commission_ledgers")
          .findOne({ saleId: sale._id }, { session });

        if (exists) continue; 

        await createSaleCommission({
          db,
          session,
          saleId: sale._id,
          narration: `Commission for ${sale.invoiceNo}`,
          salesmanId: sale.salesmanId,
          branchId: sale.branchId,
          netAmount: sale.grandTotal,
          saleDate: sale.createdAt,
        });
      }
    });

    console.log("✅ Migration Done");
  } catch (err) {
    console.error("❌ Failed:", err);
  } finally {
    await session.endSession();
  }
};

runMigration();
