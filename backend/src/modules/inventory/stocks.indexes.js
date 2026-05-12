// src/modules/stocks/stocks.indexes.js
import { ensureIndex } from "../../database/indexManager.js";

export async function stocksIndexes(db) {
  /* ============================
     STOCKS (Current Snapshot)
  ============================ */
  const stocksCol = db.collection("stocks");

  // 1️⃣ One variant per branch
  await ensureIndex(
    stocksCol,
    { branchId: 1, variantId: 1 },
    {
      unique: true,
      name: "uniq_stock_branch_variant",
    },
  );

  // 2️⃣ POS Barcode / SKU lookup
  await ensureIndex(
    stocksCol,
    { branchId: 1, sku: 1 },
    {
      name: "idx_pos_branch_sku",
    },
  );

  // 3️⃣ POS Typing Search
  await ensureIndex(
    stocksCol,
    { branchId: 1, searchableText: "text" },
    {
      name: "idx_pos_search_text",
      weights: {
        searchableText: 10,
      },
    },
  );

  // 4️⃣ Cursor pagination safety
  await ensureIndex(
    stocksCol,
    { branchId: 1, sku: 1, _id: 1 },
    {
      name: "idx_pos_cursor",
    },
  );

  // 5️⃣ Low stock / dashboard
  await ensureIndex(
    stocksCol,
    { branchId: 1, qty: 1 },
    {
      name: "idx_stock_qty",
    },
  );

  /* ============================
     STOCK MOVEMENTS (Ledger)
  ============================ */
  const stock_auditCol = db.collection("stock_audit_items");

  // 6️⃣ FIFO consume (🔥 MOST IMPORTANT)
  await ensureIndex(stock_auditCol, { auditId: 1, sku: 1 }, { unique: true });


  const movementsCol = db.collection("stock_movements");

  await ensureIndex(
    movementsCol,
    {
      branchId: 1,
      variantId: 1,
      type: 1,
      balanceQty: 1,
      createdAt: 1,
    },
    {
      name: "idx_fifo_consume",
    },
  );

  // 7️⃣ Stock ledger report
  await ensureIndex(
    movementsCol,
    {
      branchId: 1,
      variantId: 1,
      createdAt: 1,
    },
    {
      name: "idx_stock_ledger",
    },
  );

  // 8️⃣ Audit / closing stock
  await ensureIndex(
    movementsCol,
    {
      branchId: 1,
      createdAt: 1,
    },
    {
      name: "idx_stock_audit",
    },
  );

  // 9️⃣ Reference lookup (SALE / PURCHASE / TRANSFER)
  await ensureIndex(
    movementsCol,
    {
      refType: 1,
      refId: 1,
    },
    {
      name: "idx_stock_ref",
    },
  );
}
