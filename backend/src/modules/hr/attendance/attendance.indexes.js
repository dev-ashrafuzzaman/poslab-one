import { COLLECTIONS } from "../../../database/collections.js";
import { ensureIndex } from "../../../database/indexManager.js";

export async function attendanceIndexes(db) {
  const col = db.collection(COLLECTIONS.ATTENDANCES);

  /* employee attendance lookup */
  await ensureIndex(
    col,
    { employeeId: 1, date: -1 },
    { name: "idx_attendance_employee_date" }
  );

  /* branch attendance reports */
  await ensureIndex(
    col,
    { branchId: 1, date: -1 },
    { name: "idx_attendance_branch_date" }
  );

  /* daily attendance check */
  await ensureIndex(
    col,
    { employeeId: 1, date: 1 },
    { unique: true, name: "uniq_employee_daily_attendance" }
  );

  /* status filtering */
  await ensureIndex(
    col,
    { status: 1 },
    { name: "idx_attendance_status" }
  );

  /* report sorting */
  await ensureIndex(
    col,
    { date: -1 },
    { name: "idx_attendance_date" }
  );
}