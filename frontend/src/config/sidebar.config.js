// src/config/sidebar.config.js
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Truck,
  Calculator,
  BarChart3,
  FileText,
  Users,
  UserCheck,
  Briefcase,
  CalendarCheck,
  GitBranch,
  Settings,
  DiscIcon,
  SendToBack,
  DollarSignIcon,
  ArrowRightLeft,
  Building,
} from "lucide-react";

import { ROLES } from "../constants/roles";

export const SIDEBAR_MENU = [
  /* =====================================================
     CORE DASHBOARD
  ===================================================== */
  {
    header: "Overview",
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        to: "/dashboard",
      },
    ],
  },

  /* =====================================================
     SALES MANAGEMENT
  ===================================================== */
  {
    header: "Sales Management",
    roles: [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER],
    items: [
      {
        title: "Point of Sale",
        icon: ShoppingCart,
        to: "/pos",
        roles: [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER],
      },
      {
        title: "Sales Transactions",
        icon: FileText,
        roles: [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.CASHIER],
        submenu: [
          {
            title: "Manage Sales",
            to: "/sales",
          },
          {
            title: "Sales Returns",
            to: "/sales/return",
          },
        ],
      },
    ],
  },

  /* =====================================================
     PRODUCT & INVENTORY
  ===================================================== */
  {
    header: "Product & Inventory",
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
    items: [
      {
        title: "Categories",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        icon: Boxes,
        to: "/categories",
      },
      {
        title: "Products",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        icon: Package,
        submenu: [
          { title: "Manage Products", to: "/products" },
          { title: "Manage Variants", to: "/variants" },
        ],
      },
      {
        title: "Stock Management",
        icon: Boxes,
        submenu: [
          {
            title: "Stock Details",
            to: "/inventory/stock",
          },
          {
            title: "Create Transfer",
            to: "/inventory/create-transfer",
          },
          {
            title: "Manage Transfer",
            to: "/inventory/manage-transfer",
          },
          {
            title: "Low Stock Report",
            to: "/inventory/low-stock",
          },
        ],
      },
      {
        title: "Stock Audit",
        icon: SendToBack,
        submenu: [
          {
            title: "Manage Audit",
            to: "/stock-audit/manage",
          },
        ],
      },
      {
        title: "Discount Management",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        icon: DiscIcon,
        submenu: [
          { title: "Create Discount", to: "/inventory/discount-create" },
          { title: "Manage Discounts", to: "/inventory/discounts" },
        ],
      },
    ],
  },

  /* =====================================================
     PURCHASE & SUPPLY CHAIN
  ===================================================== */
  {
    header: "Purchases & Suppliers",
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    items: [
      {
        title: "Purchases",
        icon: Truck,
        submenu: [
          { title: "Create Purchase", to: "/purchases/create" },
          { title: "Manage Purchases", to: "/purchases" },
          { title: "Create Returns", to: "/purchase-returns/create" },
          { title: "Purchase Returns", to: "/purchase-returns" },
        ],
      },
      {
        title: "Suppliers",
        icon: Truck,
        to: "/suppliers",
      },
    ],
  },

  /* =====================================================
     CUSTOMERS & PARTIES
  ===================================================== */
  {
    header: "Customers & Parties",
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
    items: [
      {
        title: "Customers",
        icon: Users,
        to: "/customers",
      },
      {
        title: "Memberships",
        icon: Users,
        to: "/memberships",
      },
      {
        title: "Employees",
        icon: UserCheck,
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        to: "/employees",
      },
    ],
  },

  /* =====================================================
     FINANCE & ACCOUNTING
  ===================================================== */
  {
    header: "Finance & Accounting",
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
    items: [
      {
        title: "Expenses",
        roles: [ROLES.MANAGER],
        icon: Calculator,
        to: "/accounting/expenses",
      },
      {
        title: "Cash Transfer",
        roles: [ROLES.MANAGER],
        icon: ArrowRightLeft,
        to: "/accounting/cash-transfer",
      },
      {
        title: "Account Transfers",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        icon: ArrowRightLeft,
        to: "/accounting/account-transfers",
      },
      {
        title: "Financial Reports",
        icon: BarChart3,
        submenu: [
          { title: "Transactions", to: "/accounting/transactions" },
          { title: "Stock Report", to: "/reports/stocks" },
          { title: "Expense Report", to: "/reports/expenses" },
          { title: "Sales Report",  to: "/reports/sales" },
          { title: "Trial Balance",  roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN], to: "/reports/trial-balance" },
          { title: "Profit & Loss",  roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN], to: "/reports/profit-loss" },
          { title: "Balance Sheet",  roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN], to: "/reports/balance-sheet" },
          // { title: "Cash Flow",  roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN], to: "/reports/cash-flow" },
          { title: "Party Statement",  roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN], to: "/reports/statements" },
        ],
      },
    ],
  },

  /* =====================================================
     HR & PAYROLL
  ===================================================== */
  {
    header: "Human Resources",
    roles: [ROLES.MANAGER],
    items: [
      {
        title: "Attendance",
        icon: CalendarCheck,
        to: "/hr/attendance?view=details",
      },
      {
        title: "Payroll",
        icon: Briefcase,
        submenu: [
          { title: "Create Payroll", to: "/hr/payroll" },
          { title: "Salary Sheet", to: "/hr/payroll/salary-sheet" },
        ],
      },
    ],
  },

  /* =====================================================
     SYSTEM ADMINISTRATION
  ===================================================== */
  {
    header: "System Administration",
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    items: [
      {
        title: "Branch Management",
        roles: [ROLES.SUPER_ADMIN],
        icon: GitBranch,
        to: "/branches",
      },
      {
        title: "Opening Balance",
        roles: [ROLES.SUPER_ADMIN],
        icon: DollarSignIcon,
        to: "/settings/opening-balance",
      },
      {
        title: "User Management",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        icon: Users,
        to: "/settings/users",
      },
      {
        title: "Loyalty Settings",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        icon: Settings,
        to: "/settings/loyalty",
      },
      {
        title: "Company Info",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        icon: Building,
        to: "/settings/company-info",
      },
    ],
  },
];
