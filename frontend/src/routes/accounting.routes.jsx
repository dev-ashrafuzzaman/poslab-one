import React from "react";

const Types = React.lazy(() =>
  import("../pages/accounting/types/TypesListPage"),
);
const Ledgers = React.lazy(() =>
  import("../pages/accounting/ledger/LedgerListPage"),
);
const Subsidiary = React.lazy(() =>
  import("../pages/accounting/subsidiary/SubsidiarysListPage"),
);
const JournalEntries = React.lazy(() =>
  import("../pages/accounting/journal/JournalEntries"),
);
const JournalInvoices = React.lazy(() =>
  import("../pages/accounting/journal/JournalInvoices"),
);
const JournalSingle = React.lazy(() =>
  import("../pages/accounting/journal/JournalSinglePage"),
);

export const accountingRoutes = [
  { path: "accounting/types", element: <Types /> },
  { path: "accounting/ledgers", element: <Ledgers /> },

  { path: "subsidiaries/customers", element: <Subsidiary type="customer" /> },
  { path: "subsidiaries/suppliers", element: <Subsidiary type="supplier" /> },
  { path: "subsidiaries/employees", element: <Subsidiary type="employee" /> },

  { path: "journal/entries", element: <JournalEntries /> },
  { path: "journal/invoices", element: <JournalInvoices /> },
  { path: "journal", element: <JournalSingle /> },
];
