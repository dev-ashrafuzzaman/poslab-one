// modules/accounting/seed.accounts.js
import { ObjectId } from "mongodb";

export const seedChartOfAccounts = async (db) => {
  const accounts = [
    /* ===================================================
       1000 - ASSETS
       =================================================== */
    { code: "1000", name: "Assets", type: "ASSET", subType: "GROUP" },
    { code: "1001", name: "Main Cash", type: "ASSET", subType: "CASH", parent: "1000" },
    { code: "1002", name: "Bank & MFS Accounts Ledger", type: "ASSET", subType: "BANK", parent: "1000" },
    { code: "1003", name: "Inventory Asset", type: "ASSET", subType: "INVENTORY", parent: "1000" },
    { code: "1004", name: "Accounts Receivable (Customers)", type: "ASSET", subType: "CUSTOMER", parent: "1000" },
    { code: "1005", name: "VAT/Tax Receivable", type: "ASSET", subType: "TAX", parent: "1000" },

    /* ===================================================
       2000 - LIABILITIES
       =================================================== */
    { code: "2000", name: "Liabilities", type: "LIABILITY", subType: "GROUP" },
    { code: "2001", name: "Accounts Payable (Suppliers)", type: "LIABILITY", subType: "SUPPLIER", parent: "2000" },
    { code: "2002", name: "Salaries Payable", type: "LIABILITY", subType: "SALARY", parent: "2000" },
    { code: "2003", name: "VAT/Tax Payable", type: "LIABILITY", subType: "TAX", parent: "2000" },

    /* ===================================================
       3000 - INCOME
       =================================================== */
    { code: "3000", name: "Income", type: "INCOME", subType: "GROUP" },
    { code: "3001", name: "Product Sales Revenue", type: "INCOME", subType: "SALES", parent: "3000" },
    { code: "3002", name: "Service & Installation Income", type: "INCOME", subType: "SERVICE", parent: "3000" },
    { code: "3003", name: "Other Revenue", type: "INCOME", subType: "OTHER", parent: "3000" },

    /* ===================================================
       4000 - EXPENSES
       =================================================== */
    { code: "4000", name: "Expenses", type: "EXPENSE", subType: "GROUP" },
    { code: "4007", name: "Cost of Goods Sold (COGS)", type: "EXPENSE", subType: "COGS", parent: "4000" },

    // --- 4100: Operating & Infrastructure Expenses ---
    { code: "4100", name: "Operating Expenses", type: "EXPENSE", subType: "GROUP", parent: "4000" },
    { code: "4101", name: "Showroom & Office Rent", type: "EXPENSE", subType: "RENT", parent: "4100" },
    { code: "4102", name: "Warehouse / Godown Rent", type: "EXPENSE", subType: "RENT", parent: "4100" },
    { code: "4103", name: "Electricity & Utility Bill", type: "EXPENSE", subType: "UTILITY", parent: "4100" },
    { code: "4104", name: "Internet & Communication", type: "EXPENSE", subType: "UTILITY", parent: "4100" },
    { code: "4105", name: "Office Stationery & Supplies", type: "EXPENSE", subType: "OTHER", parent: "4100" },

    // --- 4200: Administrative & Staff Expenses ---
    { code: "4200", name: "Administrative Expenses", type: "EXPENSE", subType: "GROUP", parent: "4000" },
    { code: "4201", name: "Staff Salary & Wages", type: "EXPENSE", subType: "SALARY", parent: "4200" },
    { code: "4202", name: "Staff Conveyance & Fuel Expense", type: "EXPENSE", subType: "OTHER", parent: "4200" },
    { code: "4203", name: "Staff Entertainment & Welfare", type: "EXPENSE", subType: "OTHER", parent: "4200" },

    // --- 4300: Marketing & Customer Relations ---
    { code: "4300", name: "Selling & Distribution Expenses", type: "EXPENSE", subType: "GROUP", parent: "4000" },
    { code: "4301", name: "Product Delivery & Freight Charges", type: "EXPENSE", subType: "OTHER", parent: "4300" },
    { code: "4302", name: "Facebook Ads & Digital Marketing", type: "EXPENSE", subType: "OTHER", parent: "4300" },
    { code: "4303", name: "Sales Commission & Incentives", type: "EXPENSE", subType: "COMMISSION", parent: "4300" },
    { code: "4304", name: "Discount Expense Allowed", type: "EXPENSE", subType: "DISCOUNT", parent: "4300" },

    // --- 4400: Financial & Bank Operations ---
    { code: "4400", name: "Financial Charges", type: "EXPENSE", subType: "GROUP", parent: "4000" },
    { code: "4401", name: "Bank Charges & MFS Cashout Fees", type: "EXPENSE", subType: "OTHER", parent: "4400" },
    { code: "4402", name: "Loan Interest Paid", type: "EXPENSE", subType: "OTHER", parent: "4400" },

    /* ===================================================
       5000 - EQUITY
       =================================================== */
    { code: "5000", name: "Equity", type: "EQUITY", subType: "GROUP" },
    { code: "5001", name: "Owner Capital Investment", type: "EQUITY", subType: "CAPITAL", parent: "5000" },
    { code: "5002", name: "Retained Earnings", type: "EQUITY", subType: "RETAINED", parent: "5000" },
  ];

  const insertedMap = {};

  const existingAccounts = await db
    .collection("accounts")
    .find({ isSystem: true, branchId: null })
    .toArray();

  for (const doc of existingAccounts) {
    insertedMap[doc.code] = doc._id;
  }

  for (const acc of accounts) {
    const parentId = acc.parent ? insertedMap[acc.parent] : null;

    const existingDoc = existingAccounts.find((e) => e.code === acc.code);

    if (existingDoc) {
      await db.collection("accounts").updateOne(
        { _id: existingDoc._id },
        {
          $set: {
            name: acc.name,
            type: acc.type,
            subType: acc.subType,
            parentId: parentId,
            updatedAt: new Date(),
          },
        }
      );
      insertedMap[acc.code] = existingDoc._id;
    } else {
      const res = await db.collection("accounts").insertOne({
        code: acc.code,
        name: acc.name,
        type: acc.type,
        subType: acc.subType,
        parentId,
        isSystem: true,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      insertedMap[acc.code] = res.insertedId;
    }
  }

  console.log("✅ Chart of Accounts up-to-date. Original ObjectIds preserved to safeguard historical ledgers.");
};