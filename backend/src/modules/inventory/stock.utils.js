import { ObjectId } from "mongodb";

/**
 * upsertStock (ERP Snapshot Upsert)
 * --------------------------------
 * ✔ Branch + Variant unique
 * ✔ Safe for Purchase / Transfer / Adjustment
 * ✔ No Mongo update conflict
 * ✔ POS & Search compatible
 */
export const upsertStock = async ({
  db,
  session,

  branchId,
  variantId,

  // snapshot fields (IMPORTANT)
  productId,
  productName,
  sku,
  attributes,
  searchableText,

  // pricing cache (optional but recommended)
  salePrice,
  costPrice,

  // quantity delta
  qty,
}) => {
  if (!qty || Number(qty) === 0) return;

  const filter = {
    branchId: new ObjectId(branchId),
    variantId: new ObjectId(variantId),
  };

  const update = {
    /* ===============================
       QTY CHANGE (ATOMIC)
    =============================== */
    $inc: {
      qty: Number(qty),
    },

    /* ===============================
       ALWAYS KEEP SNAPSHOT UPDATED
    =============================== */
    $set: {
      ...(productId && { productId: new ObjectId(productId) }),
      ...(productName && { productName }),
      ...(sku && { sku }),
      ...(attributes && { attributes }),
      ...(searchableText && { searchableText }),
      ...(salePrice != null && { salePrice }),
      ...(costPrice != null && { costPrice }),

      updatedAt: new Date(),
    },

    /* ===============================
       INSERT ONLY (FIRST TIME)
    =============================== */
    $setOnInsert: {
      branchId: new ObjectId(branchId),
      variantId: new ObjectId(variantId),
      createdAt: new Date(),
    },
  };

  await db.collection("stocks").updateOne(
    filter,
    update,
    {
      upsert: true,
      session,
    }
  );
};
