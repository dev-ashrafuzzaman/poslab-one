import { ObjectId } from "mongodb";

export function validateFilters(user, filters) {
  if (!filters.from || !filters.to)
    throw { code: "DATE_REQUIRED", message: "Date range required" };

  if (new Date(filters.from) > new Date(filters.to))
    throw { code: "INVALID_DATE", message: "Invalid date range" };

  if (["Admin", "Super Admin"].includes(user.roleName)) {
    if (!filters.branchId)
      throw { code: "BRANCH_REQUIRED", message: "Branch required" };
  }

  if (filters.branchId && !ObjectId.isValid(filters.branchId))
    throw { code: "INVALID_BRANCH", message: "Invalid branchId" };
}