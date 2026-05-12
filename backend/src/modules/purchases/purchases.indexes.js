import { ensureIndex } from "../../database/indexManager.js";

export async function purchasesIndexes(db) {
  const col = db.collection("purchases");

  // Unique
  await ensureIndex(col, { purchaseNo: 1 }, { unique: true, name: "uniq_purchase_no" });

  // Core filters
  await ensureIndex(col, { branchId: 1 }, { name: "idx_purchase_branch" });
  await ensureIndex(col, { supplierId: 1 }, { name: "idx_purchase_supplier" });
  await ensureIndex(col, { createdAt: -1 }, { name: "idx_purchase_createdAt" });

  // ERP grade
  await ensureIndex(
    col,
    { branchId: 1, invoiceDate: -1 },
    { name: "idx_purchase_branch_date" }
  );

  await ensureIndex(
    col,
    { branchId: 1, supplierId: 1 },
    { name: "idx_purchase_branch_supplier" }
  );

  await ensureIndex(
    col,
    { branchId: 1, paymentStatus: 1 },
    { name: "idx_purchase_payment_status" }
  );

  await ensureIndex(
    col,
    { "items.productId": 1 },
    { name: "idx_purchase_item_product" }
  );

  await ensureIndex(
    col,
    { invoiceNumber: 1 },
    { name: "idx_purchase_invoice" }
  );
}
