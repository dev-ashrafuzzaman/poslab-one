import { ensureIndex } from "../../database/indexManager.js";

export async function salesIndexes(db) {
  const col = db.collection("sales");

  await ensureIndex(col, { invoiceNo: 1 }, { unique: true, name: "uniq_sales_invoice" });
  await ensureIndex(col, { branchId: 1 }, { name: "idx_sales_branch" });
  await ensureIndex(col, { customerId: 1 }, { name: "idx_sales_customer" });
  await ensureIndex(col, { createdAt: -1 }, { name: "idx_sales_createdAt" });
}
