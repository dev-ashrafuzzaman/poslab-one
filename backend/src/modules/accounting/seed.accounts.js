// modules/accounting/seed.accounts.js
import { ObjectId } from "mongodb";

export const seedChartOfAccounts = async (db) => {
  await db.collection("accounts").deleteMany({ isSystem: true });

  const accounts = [
    /* ======================
       ASSETS (1000)
    ====================== */
    { code: "1000", name: "Assets", type: "ASSET", subType: "GROUP" },

    {
      code: "1001",
      name: "Cash",
      type: "ASSET",
      subType: "CASH",
      parent: "1000",
    },

    {
      code: "1002",
      name: "Bank & MFS",
      type: "ASSET",
      subType: "BANK",
      parent: "1000",
    },

    // --- Mobile Financial Services ---
    {
      code: "100201",
      name: "bKash",
      type: "ASSET",
      subType: "BANK",
      parent: "1002",
    },
    {
      code: "100202",
      name: "Nagad",
      type: "ASSET",
      subType: "BANK",
      parent: "1002",
    },
    {
      code: "100203",
      name: "Rocket",
      type: "ASSET",
      subType: "BANK",
      parent: "1002",
    },
    {
      code: "100204",
      name: "Upay",
      type: "ASSET",
      subType: "BANK",
      parent: "1002",
    },

    // --- Private Commercial Banks ---
    {
      code: "100301",
      name: "BRAC Bank",
      type: "ASSET",
      subType: "BANK",
      parent: "1002",
    },
    {
      code: "100302",
      name: "Dutch-Bangla Bank (DBBL)",
      type: "ASSET",
      subType: "BANK",
      parent: "1002",
    },
    {
      code: "100303",
      name: "IFIC Bank",
      type: "ASSET",
      subType: "BANK",
      parent: "1002",
    },
    {
      code: "100304",
      name: "Mutual Trust Bank (MTB)",
      type: "ASSET",
      subType: "BANK",
      parent: "1002",
    },

    // --- State-Owned Banks ---
    {
      code: "100401",
      name: "Sonali Bank",
      type: "ASSET",
      subType: "BANK",
      parent: "1002",
    },
    {
      code: "100402",
      name: "Janata Bank",
      type: "ASSET",
      subType: "BANK",
      parent: "1002",
    },
    {
      code: "100403",
      name: "Agrani Bank",
      type: "ASSET",
      subType: "BANK",
      parent: "1002",
    },
    {
      code: "100404",
      name: "Rupali Bank",
      type: "ASSET",
      subType: "BANK",
      parent: "1002",
    },

    {
      code: "100499",
      name: "Bangladesh Bank",
      type: "ASSET",
      subType: "BANK",
      parent: "1002",
    },

    {
      code: "1003",
      name: "Inventory",
      type: "ASSET",
      subType: "INVENTORY",
      parent: "1000",
    },

    {
      code: "1004",
      name: "Accounts Receivable",
      type: "ASSET",
      subType: "CUSTOMER",
      parent: "1000",
    },

    // ✅ VAT / TAX RECEIVABLE (IMPORTANT)
    {
      code: "1005",
      name: "VAT Receivable",
      type: "ASSET",
      subType: "TAX",
      parent: "1000",
    },

    /* ======================
       LIABILITIES (2000)
    ====================== */
    { code: "2000", name: "Liabilities", type: "LIABILITY", subType: "GROUP" },

    {
      code: "2001",
      name: "Accounts Payable",
      type: "LIABILITY",
      subType: "SUPPLIER",
      parent: "2000",
    },

    {
      code: "2002",
      name: "Salary Payable",
      type: "LIABILITY",
      subType: "SALARY",
      parent: "2000",
    },

    {
      code: "2003",
      name: "Tax Payable",
      type: "LIABILITY",
      subType: "TAX",
      parent: "2000",
    },

    // ✅ Optional but recommended
    {
      code: "2004",
      name: "Bank Overdraft",
      type: "LIABILITY",
      subType: "BANK",
      parent: "2000",
    },

    /* ======================
       INCOME (3000)
    ====================== */
    { code: "3000", name: "Income", type: "INCOME", subType: "GROUP" },

    {
      code: "3001",
      name: "Sales Income",
      type: "INCOME",
      subType: "SALES",
      parent: "3000",
    },

    {
      code: "3002",
      name: "Other Income",
      type: "INCOME",
      subType: "OTHER",
      parent: "3000",
    },

    /* ======================
       EXPENSES (4000)
    ====================== */
    // { code: "4000", name: "Expenses", type: "EXPENSE", subType: "GROUP" },

    // {
    //   code: "4002",
    //   name: "Salary Expense",
    //   type: "EXPENSE",
    //   subType: "SALARY",
    //   parent: "4000",
    // },
    // {
    //   code: "4003",
    //   name: "Rent Expense",
    //   type: "EXPENSE",
    //   subType: "RENT",
    //   parent: "4000",
    // },
    // {
    //   code: "4004",
    //   name: "Utility Expense",
    //   type: "EXPENSE",
    //   subType: "UTILITY",
    //   parent: "4000",
    // },
    // {
    //   code: "4005",
    //   name: "Commission Expense",
    //   type: "EXPENSE",
    //   subType: "COMMISSION",
    //   parent: "4000",
    // },
    // {
    //   code: "4006",
    //   name: "Discount Expense",
    //   type: "EXPENSE",
    //   subType: "DISCOUNT",
    //   parent: "4000",
    // },

    // {
    //   code: "4007",
    //   name: "Cost of Goods Sold",
    //   type: "EXPENSE",
    //   subType: "COGS",
    //   parent: "4000",
    // },

    /* ======================
   EXPENSES (4000)
====================== */
    { code: "4000", name: "Expenses", type: "EXPENSE", subType: "GROUP" },

    /* ======================
   4100 - OPERATING EXPENSES
====================== */
    {
      code: "4100",
      name: "Operating Expenses",
      type: "EXPENSE",
      subType: "GROUP",
      parent: "4000",
    },
    {
      code: "4101",
      name: "Shop Rent",
      type: "EXPENSE",
      subType: "RENT",
      parent: "4100",
    },
    {
      code: "4102",
      name: "Warehouse Rent",
      type: "EXPENSE",
      subType: "RENT",
      parent: "4100",
    },
    {
      code: "4103",
      name: "Utility Expense",
      type: "EXPENSE",
      subType: "UTILITY",
      parent: "4100",
    },
    {
      code: "4104",
      name: "Internet & Communication",
      type: "EXPENSE",
      subType: "UTILITY",
      parent: "4100",
    },
    {
      code: "4105",
      name: "Office Supplies",
      type: "EXPENSE",
      subType: "OTHER",
      parent: "4100",
    },

    /* ======================
   4200 - ADMINISTRATIVE
====================== */
    {
      code: "4200",
      name: "Administrative Expenses",
      type: "EXPENSE",
      subType: "GROUP",
      parent: "4000",
    },
    {
      code: "4201",
      name: "Salary Expense",
      type: "EXPENSE",
      subType: "SALARY",
      parent: "4200",
    },
    {
      code: "4202",
      name: "Staff Welfare",
      type: "EXPENSE",
      subType: "OTHER",
      parent: "4200",
    },
    {
      code: "4203",
      name: "Training & Development",
      type: "EXPENSE",
      subType: "OTHER",
      parent: "4200",
    },

    /* ======================
   4300 - SELLING & DISTRIBUTION
====================== */
    {
      code: "4300",
      name: "Selling & Distribution",
      type: "EXPENSE",
      subType: "GROUP",
      parent: "4000",
    },
    {
      code: "4301",
      name: "Delivery Expense",
      type: "EXPENSE",
      subType: "OTHER",
      parent: "4300",
    },
    {
      code: "4302",
      name: "Packaging Expense",
      type: "EXPENSE",
      subType: "OTHER",
      parent: "4300",
    },
    {
      code: "4303",
      name: "Commission Expense",
      type: "EXPENSE",
      subType: "COMMISSION",
      parent: "4300",
    },

    /* ======================
   4400 - PRODUCTION
====================== */
    {
      code: "4400",
      name: "Production Expenses",
      type: "EXPENSE",
      subType: "GROUP",
      parent: "4000",
    },
    {
      code: "4401",
      name: "Tailoring Labour",
      type: "EXPENSE",
      subType: "OTHER",
      parent: "4400",
    },
    {
      code: "4402",
      name: "Finishing Cost",
      type: "EXPENSE",
      subType: "OTHER",
      parent: "4400",
    },

    /* ======================
   4500 - FINANCIAL CHARGES
====================== */
    {
      code: "4500",
      name: "Financial Charges",
      type: "EXPENSE",
      subType: "GROUP",
      parent: "4000",
    },
    {
      code: "4501",
      name: "Bank Charge",
      type: "EXPENSE",
      subType: "OTHER",
      parent: "4500",
    },
    {
      code: "4502",
      name: "Loan Interest",
      type: "EXPENSE",
      subType: "OTHER",
      parent: "4500",
    },

    /* ======================
   4600 - MARKETING & PROMOTION
====================== */
    {
      code: "4600",
      name: "Marketing & Promotion",
      type: "EXPENSE",
      subType: "GROUP",
      parent: "4000",
    },
    {
      code: "4601",
      name: "Facebook Ads",
      type: "EXPENSE",
      subType: "OTHER",
      parent: "4600",
    },
    {
      code: "4602",
      name: "Campaign Expense",
      type: "EXPENSE",
      subType: "OTHER",
      parent: "4600",
    },
    {
      code: "4603",
      name: "Discount Expense",
      type: "EXPENSE",
      subType: "DISCOUNT",
      parent: "4600",
    },

    /* ======================
   CORE COST
====================== */
    {
      code: "4007",
      name: "Cost of Goods Sold",
      type: "EXPENSE",
      subType: "COGS",
      parent: "4000",
    },

    /* ======================
       EQUITY (5000)
    ====================== */
    { code: "5000", name: "Equity", type: "EQUITY", subType: "GROUP" },

    {
      code: "5001",
      name: "Owner Capital",
      type: "EQUITY",
      subType: "CAPITAL",
      parent: "5000",
    },

    {
      code: "5002",
      name: "Retained Earnings",
      type: "EQUITY",
      subType: "RETAINED",
      parent: "5000",
    },
  ];

  const inserted = {};

  for (const acc of accounts) {
    const parentId = acc.parent ? inserted[acc.parent] : null;

    const res = await db.collection("accounts").insertOne({
      code: acc.code,
      name: acc.name,
      type: acc.type,
      subType: acc.subType,
      parentId,
      isSystem: true,
      branchId: null,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    inserted[acc.code] = res.insertedId;
  }

  console.log(
    "✅ FINAL Chart of Accounts seeded successfully (Accounting Safe)",
  );
};
