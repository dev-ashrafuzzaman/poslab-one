import { ensureIndex } from "../../../database/indexManager.js";

export async function salarySheetIndexes(db) {
  const col = db.collection("salary_sheets");
  const colcom = db.collection("commission_ledgers");

  // Unique
  await ensureIndex(col, { branchId: 1, month: 1 });
  await ensureIndex(colcom, { employeeId: 1, month: 1 });
  await ensureIndex(colcom, { saleId: 1 }, { unique: true });
}
