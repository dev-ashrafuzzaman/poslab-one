import { ensureIndex } from "../../database/indexManager.js";

export async function customersIndexes(db) {
  const col = db.collection("customers");

  await ensureIndex(col, { phone: 1 }, { unique: true, name: "uniq_customer_phone" });
  await ensureIndex(col, { status: 1 }, { name: "idx_customer_status" });
}
