import { COLLECTIONS } from "../../database/collections.js";
import { ensureIndex } from "../../database/indexManager.js";

export async function attributesIndexes(db) {
  const col = db.collection(COLLECTIONS.ATTRIBUTES);

  await ensureIndex(
    col,
    { type: 1, name: 1 },
    { unique: true, name: "uniq_attribute_type_name" }
  );

  await ensureIndex(col, { status: 1 }, { name: "idx_attribute_status" });
}
