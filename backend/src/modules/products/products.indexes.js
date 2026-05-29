import { ensureIndex } from "../../database/indexManager.js";

export async function productsIndexes(db) {
  const productsCol = db.collection("products");
  const variantsCol = db.collection("product_variants");
  await ensureIndex(
    productsCol,
    { name: 1, brandId: 1, categoryId: 1 },
    { unique: true, name: "uniq_product_name_brand_category" },
  );

  await ensureIndex(
    productsCol,
    { productCode: 1 },
    { unique: true, name: "uniq_product_code" },
  );

  await ensureIndex(
    productsCol,
    { barcode: 1 },
    {
      unique: true,
      partialFilterExpression: { barcode: { $type: "string" } },
      name: "uniq_product_barcode",
    },
  );

  await ensureIndex(
    productsCol,
    { productTypeId: 1 },
    { name: "idx_product_type" },
  );
  await ensureIndex(
    productsCol,
    { categoryId: 1 },
    { name: "idx_product_category" },
  );
  await ensureIndex(
    productsCol,
    { subCategoryId: 1 },
    { name: "idx_product_subcategory" },
  );
  await ensureIndex(productsCol, { brandId: 1 }, { name: "idx_product_brand" });
  await ensureIndex(productsCol, { status: 1 }, { name: "idx_product_status" });
  await ensureIndex(
    productsCol,
    { status: 1, createdAt: -1 },
    { name: "idx_product_status_createdAt" },
  );

  await ensureIndex(
    productsCol,
    { name: "text", model: "text" },
    {
      weights: { name: 10, model: 5 },
      name: "text_product_search_engine",
    },
  );

  await ensureIndex(variantsCol, { productId: 1 }, { name: "idx_variant_product_link" });
  await ensureIndex(variantsCol, { productCode: 1 }, { name: "idx_variant_product_code" });

  await ensureIndex(
    variantsCol,
    { sku: 1 },
    { unique: true, name: "uniq_variant_sku" }
  );


  await ensureIndex(
    variantsCol,
    { barcode: 1 },
    { 
      name: "idx_variant_barcode_search" 
    }
  );

  await ensureIndex(variantsCol, { status: 1 }, { name: "idx_variant_status" });
  await ensureIndex(variantsCol, { stock: 1 }, { name: "idx_variant_stock_level" });

}