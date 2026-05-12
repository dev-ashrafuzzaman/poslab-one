import { ObjectId } from "mongodb";
import { resolveSystemAccounts } from "../account.resolver.js";
import { getDB } from "../../../config/db.js";

export const getBranchCashBalance = async ({
  branchId
}) => {
const db = getDB();
  const SYS = await resolveSystemAccounts(db);

  const result = await db.collection("ledgers").aggregate([
    {
      $match: {
        accountId: SYS.CASH,
        branchId: new ObjectId(branchId)
      }
    },
    {
      $group: {
        _id: null,
        totalDebit: { $sum: "$debit" },
        totalCredit: { $sum: "$credit" }
      }
    }
  ]).toArray();

  if (!result.length) {
    return 0;
  }

  const { totalDebit, totalCredit } = result[0];

  return totalDebit - totalCredit;
};