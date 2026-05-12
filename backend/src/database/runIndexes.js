import { accountsIndexes } from "../modules/accounting/accounts/accounts.indexes.js";
import { cashTransferIndexes } from "../modules/accounting/cashTransfer/cashTransfer.indexed.js";
import { journalsIndexes } from "../modules/accounting/journals/journals.indexes.js";
import { ledgersIndexes } from "../modules/accounting/ledgers/ledgers.indexes.js";
import { auditLogsIndexes } from "../modules/administration/auditLogs.indexes.js";
import { attributesIndexes } from "../modules/attributes/attributes.indexes.js";
import { branchesIndexes } from "../modules/branches/branches.indexes.js";
import { categoriesIndexes } from "../modules/categories/categories.indexes.js";
import { customersIndexes } from "../modules/customers/customers.indexes.js";
import { attendanceIndexes } from "../modules/hr/attendance/attendance.indexes.js";
import { salarySheetIndexes } from "../modules/hr/payroll/payroll.indexes.js";
import { discountsIndexes } from "../modules/inventory/discount/discount.indexes.js";
import { stocksIndexes } from "../modules/inventory/stocks.indexes.js";
import { membershipsIndexes } from "../modules/membership/membership.indexes.js";
import { productsIndexes } from "../modules/products/products.indexes.js";
import { purchasesIndexes } from "../modules/purchases/purchases.indexes.js";
import { salesIndexes } from "../modules/sales/sales.indexes.js";
import { settingsIndexes } from "../modules/settings/settings.indexes.js";
import { suppliersIndexes } from "../modules/suppliers/suppliers.indexes.js";
import { usersIndexes } from "../modules/users/users.indexes.js";
import { variantsIndexes } from "../modules/variants/variants.indexes.js";

export async function runIndexes(db) {
  console.log("🔧 Ensuring database indexes...");
 
  await branchesIndexes(db);
  await categoriesIndexes(db);
  await productsIndexes(db);
  await variantsIndexes(db);
  await attributesIndexes(db);
  await stocksIndexes(db);
  await purchasesIndexes(db);
  await salesIndexes(db);
  await customersIndexes(db);
  await suppliersIndexes(db);
  await usersIndexes(db);
  await auditLogsIndexes(db);
  await ledgersIndexes(db);
  await settingsIndexes(db);
  await journalsIndexes(db);
  await accountsIndexes(db);
  await discountsIndexes(db);
  await membershipsIndexes(db);
  await salarySheetIndexes(db);
  await cashTransferIndexes(db);
  await attendanceIndexes(db);

  console.log("✅ All indexes ensured (migration-safe)");
}
