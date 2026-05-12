import { ensureIndex } from "../../database/indexManager.js";

export async function usersIndexes(db) {
  const col = db.collection("users");

  await ensureIndex(
    col,
    { email: 1 },
    {
      unique: true,
      sparse: true,
      name: "uniq_user_email",
    },
  );

  await ensureIndex(
    col,
    { employeeId: 1 },
    {
      unique: true,
      name: "uniq_user_employee",
      partialFilterExpression: {
        employeeId: { $exists: true },
      },
    },
  );

  await ensureIndex(
    col,
    { branchId: 1 },
    {
      name: "idx_user_branch",
    },
  );
  await ensureIndex(
    col,
    { status: 1 },
    {
      name: "idx_user_status",
    },
  );

  await ensureIndex(
    col,
    { isSuperAdmin: 1 },
    {
      name: "idx_user_superadmin",
    },
  );

  await ensureIndex(
    col,
    { createdAt: -1 },
    {
      name: "idx_user_createdAt",
    },
  );
}
