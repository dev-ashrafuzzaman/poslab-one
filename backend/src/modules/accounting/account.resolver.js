// modules/accounting/account.resolver.js

let CACHE = null;

export const resolveSystemAccounts = async (db) => {
  if (CACHE) return CACHE;

  const accounts = await db
    .collection("accounts")
    .find({
      isSystem: true,
      status: "ACTIVE",
      branchId: null,
    })
    .toArray(); 

  if (!accounts.length) {
    throw new Error("System accounts not found. Did you run seed?");
  }

  const findAccount = (type, subType) => {
    const acc = accounts.find((a) => a.type === type && a.subType === subType);

    if (!acc) {
      throw new Error(
        `System account missing for type=${type}, subType=${subType}`,
      );
    }

    return acc._id;
  };

  const findAccCode = (code) => {

  const acc = accounts.find((a) => a.code === code);

  if (!acc) {
    throw new Error(
      `System account missing for code=${code}`
    );
  }

  return acc._id;
};


  CACHE = {
    /* ========= ASSETS ========= */
    CASH: findAccount("ASSET", "CASH"),
    BANK: findAccount("ASSET", "BANK"),
    INVENTORY: findAccount("ASSET", "INVENTORY"),
    CUSTOMER_AR: findAccount("ASSET", "CUSTOMER"),

    /* ======== LIABILITIES ======== */
    SUPPLIER_AP: findAccount("LIABILITY", "SUPPLIER"),
    SALARY_PAYABLE: findAccount("LIABILITY", "SALARY"),
    TAX_PAYABLE: findAccount("LIABILITY", "TAX"),

    /* ========= INCOME ========= */
    SALES_INCOME: findAccount("INCOME", "SALES"),
    OTHER_INCOME: findAccount("INCOME", "OTHER"),

    /* ========= EXPENSE ========= */
    COGS: findAccount("EXPENSE", "COGS"),
    SALARY_EXPENSE: findAccount("EXPENSE", "SALARY"),
    COMMISSION_EXPENSE: findAccount("EXPENSE", "COMMISSION"),
    DISCOUNT_EXPENSE: findAccount("EXPENSE", "DISCOUNT"),
    RENT_EXPENSE: findAccount("EXPENSE", "RENT"),
    UTILITY_EXPENSE: findAccount("EXPENSE", "UTILITY"),
    BANK_CHARGE: findAccCode("4501"),

    /* ========= EQUITY ========= */
    OWNER_CAPITAL: findAccount("EQUITY", "CAPITAL"),
    RETAINED_EARNINGS: findAccount("EQUITY", "RETAINED"),
  };

  return CACHE;
};

export const clearAccountResolverCache = () => {
  CACHE = null;
};
