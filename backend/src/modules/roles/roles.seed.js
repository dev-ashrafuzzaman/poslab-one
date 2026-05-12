// roles.seed.data.js
import { PERMISSIONS } from "./permissions.registry.js";
import { flattenPermissions } from "./permission.utils.js";

export const ROLE_SEEDS = [
  // {
  //   name: "Super Admin",
  //   isSystem: true,
  //   permissions: ["*"],
  // },

  {
    name: "Admin",
    permissions: flattenPermissions({
      SYSTEM: PERMISSIONS.SYSTEM,
      PRODUCT: PERMISSIONS.PRODUCT,
      PURCHASE: PERMISSIONS.PURCHASE,
      SALE: PERMISSIONS.SALE,
      CUSTOMER: PERMISSIONS.CUSTOMER,
      SUPPLIER: PERMISSIONS.SUPPLIER,
      ACCOUNT: PERMISSIONS.ACCOUNT,
      EMPLOYEE: PERMISSIONS.EMPLOYEE,
      REPORT: PERMISSIONS.REPORT,
      BRANCH: PERMISSIONS.BRANCH,
    }),
  },

  {
    name: "Manager",
    permissions: flattenPermissions({
      PRODUCT: PERMISSIONS.PRODUCT,
      PURCHASE: PERMISSIONS.PURCHASE,
      SALE: PERMISSIONS.SALE,
      CUSTOMER: PERMISSIONS.CUSTOMER,
      SUPPLIER: PERMISSIONS.SUPPLIER,
      ACCOUNT: {
        LEDGER: PERMISSIONS.ACCOUNT.LEDGER,
        REPORT: PERMISSIONS.ACCOUNT.REPORT,
      },
      REPORT: PERMISSIONS.REPORT,
    }),
  },

  {
    name: "Cashier",
    permissions: flattenPermissions({
      SALE: {
        CREATE: PERMISSIONS.SALE.CREATE,
        VIEW: PERMISSIONS.SALE.VIEW,
        PRINT: PERMISSIONS.SALE.PRINT,
      },
      CUSTOMER: {
        CREATE: PERMISSIONS.CUSTOMER.CREATE,
        VIEW: PERMISSIONS.CUSTOMER.VIEW,
      },
    }),
  },

  // {
  //   name: "Accountant",
  //   permissions: flattenPermissions({
  //     ACCOUNT: PERMISSIONS.ACCOUNT,
  //     REPORT: {
  //       PROFIT_LOSS: PERMISSIONS.REPORT.PROFIT_LOSS,
  //     },
  //   }),
  // },
];
