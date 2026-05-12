import { Router } from "express";
import authRoutes from "./src/modules/auth/auth.routes.js";
import roleRoutes from "./src/modules/roles/role.routes.js";
import userRoutes from "./src/modules/users/user.routes.js";
import branchRoutes from "./src/modules/branches/branch.routes.js";
import customerRoutes from "./src/modules/customers/customer.routes.js";
import employeeRoutes from "./src/modules/employee/employee.routes.js";
import categoryRoutes from "./src/modules/categories/category.routes.js";
import productRoutes from "./src/modules/products/product.routes.js";
import variantRoutes from "./src/modules/variants/variant.routes.js";
import supplierRoutes from "./src/modules/suppliers/supplier.routes.js";
import purchaseRoutes from "./src/modules/purchases/purchase.routes.js";
import attendanceRoutes from "./src/modules/hr/attendance/attendance.routes.js";
import saleRoutes from "./src/modules/sales/sales.routes.js";
import discountRoutes from "./src/modules/inventory/discount/discount.routes.js";
import membershipRoutes from "./src/modules/membership/membership.routes.js";

// REPORTS ROUTES
import ledgerRoutes from "./src/modules/accounting/reports/ledger/ledger.routes.js";
import profitAndLossAdvanceRoutes from "./src/modules/accounting/reports/profitLoss/profitLoss.routes.js";
import balanceSheetRoutes from "./src/modules/accounting/reports/balanceSheet/balanceSheet.routes.js";
import closingRoutes from "./src/modules/accounting/reports/closing/yearClosing.routes.js";
import statementRoutes from "./src/modules/accounting/reports/statement/statement.routes.js";
import trialBalanceRoutes from "./src/modules/accounting/reports/trialBalance/trialBalance.routes.js";
import stockRoutes from "./src/modules/inventory/stock.routes.js";
import adminRoutes from "./src/modules/administration/admin.route.js";
import dashboardRoutes from "./src/modules/dashboard/dashboard.route.js";
import stockAuditRoutes from "./src/modules/inventory/stockAudit/stockAudit.routes.js";
import expensesRoutes from "./src/modules/accounting/expenses/expense.routes.js";
import accountsRoutes from "./src/modules/accounting/accounts/accounts.routes.js";
import payrollRoutes from "./src/modules/hr/payroll/payroll.routes.js";
import cashTransferRoutes from "./src/modules/accounting/cashTransfer/cashTransfer.routes.js";
import AccountTransferRoutes from "./src/modules/accounting/accountTransfer/accountTransfer.routes.js";
import SettingRoutes from "./src/modules/settings/settings.routes.js";

import { authenticate } from "./src/middlewares/auth.middleware.js";

const router = Router();

router.use("/auth", authRoutes);

router.use(authenticate);
router.use("/settings", SettingRoutes);
router.use("/account-transfer", AccountTransferRoutes);
router.use("/cash-transfer", cashTransferRoutes);
router.use("/payroll", payrollRoutes);
router.use("/memberships", membershipRoutes);
router.use("/discounts", discountRoutes);
router.use("/activities", adminRoutes);
router.use("/roles", roleRoutes);
router.use("/users", userRoutes);
router.use("/branches", branchRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/variants", variantRoutes);
router.use("/customers", customerRoutes);
router.use("/employees", employeeRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/sales", saleRoutes);
router.use("/stocks", stockRoutes);
router.use("/audits", stockAuditRoutes);
router.use("/accounts", accountsRoutes);
router.use("/expenses", expensesRoutes);

router.use("/dashboard", dashboardRoutes);

// REPORTS ROUTES
router.use("/reports/profit-loss", profitAndLossAdvanceRoutes);
router.use("/reports/ledgers", ledgerRoutes);
router.use("/reports/balance-sheet", balanceSheetRoutes);
router.use("/reports/close-year", closingRoutes);
router.use("/reports/statement", statementRoutes);
router.use("/reports/trial-balance", trialBalanceRoutes);

export default router;
