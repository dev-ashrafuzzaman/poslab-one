// modules/accounting/account.resolver.js

let CACHE = null;

/**
 * Resolves transactional operational reference ObjectIds via strict tracking scheme mappings.
 * Memory registry ensures sub-ledger mutations do not generate performance penalties or database degradation.
 * @param {Object} db - MongoDB Database Instance
 */
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

  if (!accounts || accounts.length === 0) {
    throw new Error(
      "[Accounting Operational Halt] System charts unseeded or unavailable in database.",
    );
  }

  const getLedgerIdByCode = (code) => {
    const account = accounts.find((a) => a.code === code);
    if (!account) {
      throw new Error(
        `[Structural Integrity Alert] Crucial financial node missing for designated tracking chart code: ${code}`,
      );
    }
    return account._id;
  };

  CACHE = {
    /* ================= ASSETS ================= */
    MAIN_CASH: getLedgerIdByCode("1001"),
    BANK_MFS_PARENT: getLedgerIdByCode("1002"),
    INVENTORY_ASSET: getLedgerIdByCode("1003"),
    ACCOUNTS_RECEIVABLE: getLedgerIdByCode("1004"),
    VAT_RECEIVABLE: getLedgerIdByCode("1005"),

    /* =============== LIABILITIES =============== */
    ACCOUNTS_PAYABLE: getLedgerIdByCode("2001"),
    SALARY_PAYABLE: getLedgerIdByCode("2002"),
    TAX_PAYABLE: getLedgerIdByCode("2003"),

    /* ================= INCOME ================= */
    SALES_REVENUE: getLedgerIdByCode("3001"),
    SERVICE_REVENUE: getLedgerIdByCode("3002"),
    OTHER_REVENUE: getLedgerIdByCode("3003"),

    /* ================ EXPENSES ================ */
    COGS: getLedgerIdByCode("4007"),
    SHOP_RENT: getLedgerIdByCode("4101"),
    WAREHOUSE_RENT: getLedgerIdByCode("4102"),
    UTILITIES: getLedgerIdByCode("4103"),
    INTERNET_COMM: getLedgerIdByCode("4104"),
    OFFICE_SUPPLIES: getLedgerIdByCode("4105"),
    STAFF_SALARY: getLedgerIdByCode("4201"),
    CONVEYANCE: getLedgerIdByCode("4202"),
    STAFF_WELFARE: getLedgerIdByCode("4203"),
    DELIVERY_FREIGHT: getLedgerIdByCode("4301"),
    DIGITAL_MARKETING: getLedgerIdByCode("4302"),
    SALES_COMMISSION: getLedgerIdByCode("4303"),
    DISCOUNT_ALLOWED: getLedgerIdByCode("4304"),
    BANK_MFS_CHARGES: getLedgerIdByCode("4401"),
    LOAN_INTEREST: getLedgerIdByCode("4402"),

    /* ================= EQUITY ================= */
    OWNER_CAPITAL: getLedgerIdByCode("5001"),
    RETAINED_EARNINGS: getLedgerIdByCode("5002"),
  };

  return CACHE;
};

/**
 * Flush cache instance safely when accounting node operations trigger modifications.
 */
export const clearAccountResolverCache = () => {
  CACHE = null;
};
