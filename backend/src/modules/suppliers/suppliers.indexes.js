import { ensureIndex } from "../../database/indexManager.js";

export async function suppliersIndexes(db) {
  const col = db.collection("suppliers");

  await ensureIndex(
    col,
    { "contact.phone": 1 },
    { unique: true, sparse: true, name: "uniq_supplier_phone" }
  );
}
