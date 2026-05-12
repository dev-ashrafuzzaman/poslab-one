import { ensureIndex } from "../../database/indexManager.js";

export async function productsIndexes(db) {
  const col = db.collection("products");

  await ensureIndex(
    col,
    { name: 1, categoryId: 1, productTypeId: 1 },
    { unique: true, name: "uniq_product_name_category_type" }
  );

  await ensureIndex( 
    col,
    { sku: 1 },
    {
      unique: true,
      partialFilterExpression: { sku: { $exists: true } },
      name: "uniq_product_sku",
    }
  );

  await ensureIndex(col, { categoryId: 1 }, { name: "idx_product_category" });
  await ensureIndex(col, { status: 1 }, { name: "idx_product_status" });
  await ensureIndex(col, { createdAt: -1 }, { name: "idx_product_createdAt" });
}
