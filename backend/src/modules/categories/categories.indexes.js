// src/modules/categories/categories.indexes.js
import { COLLECTIONS } from "../../database/collections.js";
import { ensureIndex } from "../../database/indexManager.js";

export async function categoriesIndexes(db) {
  const col = db.collection(COLLECTIONS.CATEGORIES);

  /* ------------------------------------------------
   * 1️⃣ Parent → Children lookup (Tree build)
   * ------------------------------------------------ */
  await ensureIndex(
    col,
    { parentId: 1 },
    { name: "idx_category_parent" }
  );

  /* ------------------------------------------------
   * 2️⃣ Category Level filtering (Hierarchy)
   * ------------------------------------------------ */
  await ensureIndex(
    col,
    { level: 1 },
    { name: "idx_category_level" }
  );

  /* ------------------------------------------------
   * 3️⃣ Unique name per parent (CORE ERP RULE)
   * ------------------------------------------------
   * Prevents duplicate category under same parent
   */
  await ensureIndex(
    col,
    { parentId: 1, name: 1 },
    {
      unique: true,
      name: "uniq_category_parent_name",
    }
  );

  /* ------------------------------------------------
   * 4️⃣ Status filter (UI / Soft delete)
   * ------------------------------------------------ */
  await ensureIndex(
    col,
    { status: 1 },
    { name: "idx_category_status" }
  );
}
