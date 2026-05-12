import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import Spinner from "./components/common/Spinner";
import LayoutWrapper from "./layouts/LayoutWrapper";

const Login = React.lazy(() => import("./pages/auth/Login"));
const Dashboard = React.lazy(() => import("./pages/dashboard/Dashboard"));
const Unauthorized = React.lazy(() => import("./pages/errors/Unauthorized"));



const UsersListPage = React.lazy(() => import("./pages/setting/user/UserPage"));

const TrialBalance = React.lazy(() => import("./pages/report/TrialBalance"));
const BalanceSheetReport = React.lazy(
  () => import("./pages/report/BalanceSheet"),
);

// POS ROUTE

const CategoriesPage = React.lazy(
  () => import("./pages/products/category/CategoriesPage"),
);
const ProductsPage = React.lazy(() => import("./pages/products/ProductsPage"));


const VariantsPage = React.lazy(
  () => import("./pages/products/variant/VariantPage"),
);
const PurchaseCreatePage = React.lazy(
  () => import("./pages/purchase/PurchaseCreatePage"),
);
const PurchasesPage = React.lazy(
  () => import("./pages/purchase/PurchasesPage"),
);
const PurchasesInvoicePage = React.lazy(
  () => import("./pages/purchase/invoices/PurchaseInvoice"),
);
const PurchasesReturnInvoicePage = React.lazy(
  () => import("./pages/purchase/invoices/PurchaseReturnInvoice"),
);
const PurchaseReturnCreatePage = React.lazy(
  () => import("./pages/purchase/PurchaseReturnCreatePage"),
);
const PurchaseReturnPage = React.lazy(
  () => import("./pages/purchase/PurchasesReturnPage"),
);
const CustomerPage = React.lazy(
  () => import("./pages/parties/customer/CustomerPage"),
);
const SupplierPage = React.lazy(
  () => import("./pages/parties/supplier/SupplierPage"),
);
const EmployeePage = React.lazy(
  () => import("./pages/parties/employee/EmployeePage"),
);

const StockPage = React.lazy(
  () => import("./pages/inventory/StockPage"),
);
const AttendancePage = React.lazy(
  () => import("./pages/hr/AttendancePage"),
);
const ActivityPage = React.lazy(
  () => import("./pages/setting/activity/ActivityPage"),
);
const POSCreatePage = React.lazy(
  () => import("./pages/sales/PosPage"),
);
const SalesPage = React.lazy(
  () => import("./pages/sales/SalesPage"),
);
const SalesReturnPage = React.lazy(
  () => import("./pages/sales/SalesReturnPage"),
);
const LowStockPage = React.lazy(
  () => import("./pages/inventory/LowStockPage"),
);
const CreateStockTransferPage = React.lazy(
  () => import("./pages/inventory/stock/CreateStockTransferPage"),
);
const StockTranaferPage = React.lazy(
  () => import("./pages/inventory/stock/StockTranaferPage"),
);
const ProfitAndLossAdvanceReport = React.lazy(
  () => import("./pages/report/ProfitLossAdvanced"),
);
const CashFlowReport = React.lazy(
  () => import("./pages/report/CashFlow"),
);
const PartyInvoiceStatementReport = React.lazy(
  () => import("./pages/report/PartyInvoiceStatement"),
);
const PartyStatementReport = React.lazy(
  () => import("./pages/report/PartyStatement"),
);
const OpeningBalancePage = React.lazy(
  () => import("./pages/accounting/OpeningBalancePage"),
);
const BranchesPage = React.lazy(
  () => import("./pages/setting/branches/BranchesPage"),
);
const CompanyPage = React.lazy(
  () => import("./pages/setting/company/CompanyInfo"),
);

const DiscountCreatePage = React.lazy(() => import("./pages/inventory/discount/DiscountCreatePage"));
const DiscountsPage = React.lazy(() => import("./pages/inventory/discount/DiscountsPage"));
const MembershipsPage = React.lazy(() => import("./pages/parties/membership/MembershipPage"));
const LoyaltySettingPage = React.lazy(() => import("./pages/setting/loyalty/LoyaltySettingPage"));
const MembershipOverviewPage  = React.lazy(() => import("./pages/parties/membership/MembershipOverviewPage"));
const ReceiveStockTransferPage  = React.lazy(() => import("./pages/inventory/stock/ReceiveStockTransferPage"));
const StockAuditsListPage  = React.lazy(() => import("./pages/inventory/stockAudit/StockAuditsListPage"));
const StockAuditsScanPage  = React.lazy(() => import("./pages/inventory/stockAudit/AuditScanPage"));
const StockAuditsReportPage  = React.lazy(() => import("./pages/inventory/stockAudit/AuditReportPage"));
const StockReportPage  = React.lazy(() => import("./pages/report/StockReportPage"));
const SalesReportPage  = React.lazy(() => import("./pages/report/SalesReportPage"));
const ExpensePage  = React.lazy(() => import("./pages/accounting/expenses/ExpensePage"));
const SalarySheetPage  = React.lazy(() => import("./pages/hr/salary/SalarySheetPage"));
const SalarySheetList  = React.lazy(() => import("./pages/hr/salary/SalarySheetList"));
const SalarySheetDetails  = React.lazy(() => import("./pages/hr/salary/SalarySheetDetails"));
const CashTransferPage  = React.lazy(() => import("./pages/accounting/cashTransfer/CashTransferPage"));
const TransactionsPage  = React.lazy(() => import("./pages/accounting/transactions/TransactionsPage"));
const ExpenseReportPage  = React.lazy(() => import("./pages/report/ExpenseReportPage"));
const AccountTransferPage  = React.lazy(() => import("./pages/accounting/accountTransfer/AccountTransferPage"));

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
      }>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          element={
            <LayoutWrapper layout="main">
              <PrivateRoute />
            </LayoutWrapper>
          }>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/settings/company-info" element={<CompanyPage />} />
          <Route path="/reports/expenses" element={<ExpenseReportPage />} />
          <Route path="/accounting/account-transfers" element={<AccountTransferPage />} />
          <Route path="/accounting/cash-transfer" element={<CashTransferPage />} />
          <Route path="/accounting/transactions" element={<TransactionsPage />} />
          <Route path="/hr/payroll/salary-sheet/:id" element={<SalarySheetDetails  />} />
          <Route path="/hr/payroll/salary-sheet" element={<SalarySheetList  />} />
          <Route path="/hr/payroll" element={<SalarySheetPage  />} />
          <Route path="/accounting/expenses" element={<ExpensePage  />} />
          <Route path="/reports/sales" element={<SalesReportPage  />} />
          <Route path="/reports/stocks" element={<StockReportPage  />} />
          <Route path="/stock-audit/report/:auditId" element={<StockAuditsReportPage  />} />
          <Route path="/stock-audit/manage" element={<StockAuditsListPage  />} />
          <Route path="/stock-audit/scan/:auditId" element={<StockAuditsScanPage  />} />
          <Route path="/memberships/:customerId" element={<MembershipOverviewPage  />} />
          <Route path="/inventory/receive-transfer/:id" element={<ReceiveStockTransferPage  />} />
          <Route path="/settings/loyalty" element={<LoyaltySettingPage />} />
          <Route path="/memberships" element={<MembershipsPage />} />
          <Route path="/inventory/discounts" element={<DiscountsPage />} />
          <Route path="/inventory/discount-create" element={<DiscountCreatePage />} />
          <Route path="/settings/opening-balance" element={<OpeningBalancePage />} />
          <Route path="/reports/statements" element={<PartyStatementReport />} />
          <Route path="/reports/cash-flow" element={<CashFlowReport />} />
          <Route path="/reports/profit-loss" element={<ProfitAndLossAdvanceReport />} />
          <Route path="/reports/balance-sheet" element={<BalanceSheetReport />} />
          <Route path="/pos" element={<POSCreatePage />} />
          <Route path="/inventory/create-transfer" element={<CreateStockTransferPage />} />
          <Route path="/inventory/manage-transfer" element={<StockTranaferPage />} />
          <Route path="/inventory/low-stock" element={<LowStockPage />} />
          <Route path="/sales/return" element={<SalesReturnPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/settings/logs" element={<ActivityPage />} />
          <Route path="/hr/attendance" element={<AttendancePage />} />
          <Route path="/branches" element={<BranchesPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/variants" element={<VariantsPage />} />

          <Route path="/purchases" element={<PurchasesPage />} />
          <Route path="/purchases/create" element={<PurchaseCreatePage />} />
          <Route
            path="/purchases/:id/invoice"
            element={<PurchasesInvoicePage />}
          />

          <Route path="/purchase-returns" element={<PurchaseReturnPage />} />
          <Route
            path="/purchase-returns/create"
            element={<PurchaseReturnCreatePage />}
          />
          <Route
            path="/purchase-returns/:id/invoice"
            element={<PurchasesReturnInvoicePage />}
          />

          <Route path="/customers" element={<CustomerPage />} />
          <Route path="/suppliers" element={<SupplierPage />} />
          <Route path="/employees" element={<EmployeePage />} />

          <Route path="/inventory/stock" element={<StockPage />} />

          {/* company */}


         
   
          <Route path="/reports/trial-balance" element={<TrialBalance />} />

          {/*user */}
          <Route path="/settings/users" element={<UsersListPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
