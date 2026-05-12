// src/modules/variants/variants.indexes.js
import { ensureIndex } from "../../database/indexManager.js";
import { COLLECTIONS } from "../../database/collections.js";

export async function variantsIndexes(db) {
  const col = db.collection(COLLECTIONS.VARIANTS);

  await ensureIndex(col, { sku: 1 }, { unique: true, name: "uniq_variant_sku" });

  await ensureIndex(
    col,
    {
      productId: 1,
      "attributes.size": 1,
      "attributes.color": 1,
    },
    { unique: true, name: "uniq_variant_per_product" }
  );

  await ensureIndex(col, { productId: 1 }, { name: "idx_variant_product" });
  await ensureIndex(col, { status: 1 }, { name: "idx_variant_status" });
  await ensureIndex(col, { createdAt: -1 }, { name: "idx_variant_createdAt" });
}
