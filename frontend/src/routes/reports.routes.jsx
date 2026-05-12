import React from "react";

const COA = React.lazy(() => import("../pages/report/ChartOfAccounts"));
const Ledger = React.lazy(() => import("../pages/report/ledger/Ledger"));
const CustomerBalance = React.lazy(() =>
  import("../pages/report/CustomerBalance"),
);
const SupplierBalance = React.lazy(() =>
  import("../pages/report/SupplierBalance"),
);
const EmployeeAdvance = React.lazy(() =>
  import("../pages/report/EmoloyeeAdvance"),
);
const TrialBalance = React.lazy(() =>
  import("../pages/report/TrialBalance"),
);
const JournalVoucher = React.lazy(() =>
  import("../pages/report/JournalVoucher"),
);

export const reportRoutes = [
  { path: "reports/coa", element: <COA /> },
  { path: "reports/ledger", element: <Ledger /> },
  { path: "reports/customer-balance", element: <CustomerBalance /> },
  { path: "reports/supplier-balance", element: <SupplierBalance /> },
  { path: "reports/employee-advance", element: <EmployeeAdvance /> },
  { path: "reports/trial-balance", element: <TrialBalance /> },
  { path: "reports/journal-voucher", element: <JournalVoucher /> },
];
