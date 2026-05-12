export const PERMISSIONS = Object.freeze({
  BRANCH_VIEW: "branch_view",
  BRANCH_MANAGE: "branch_manage",

  SUPPLIER_VIEW: "supplier_view",
  SUPPLIER_MANAGE: "supplier_manage",

  CATEGORY_VIEW: "category_view",
  CATEGORY_MANAGE: "category_manage",
  EMPLOYEE_VIEW: "employee_view",
  EMPLOYEE_MANAGE: "employee_manage",
  // Products
  PRODUCT_VIEW: "product:view",
  PRODUCT_CREATE: "product:create",
  PRODUCT_UPDATE: "product:update",
  PRODUCT_DELETE: "product:delete",

  // Inventory
  STOCK_VIEW: "stock:view",
  STOCK_ADJUST: "stock:adjust",

  // Sales
  SALE_CREATE: "sale:create",
  SALE_VIEW: "sale:view",

  // Purchase
  PURCHASE_CREATE: "purchase:create",

  // User & Role
  USER_MANAGE: "user:manage",
  ROLE_MANAGE: "role:manage",
});
