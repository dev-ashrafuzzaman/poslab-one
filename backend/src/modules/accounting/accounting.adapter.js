import { postJournalEntry } from "./journals/journals.service.js";
import { resolveSystemAccounts } from "./account.resolver.js";
import { roundMoney } from "../../utils/money.js";

const resolveAccountByCode = async (db, code) => {
  const acc = await db.collection("accounts").findOne({ code });
  if (!acc) {
    throw new Error(`Account not found: ${code}`);
  }
  return acc._id;
};

/* ======================================================
   SALES ACCOUNTING
====================================================== */
export const salesAccounting = async ({
  db,
  session,
  saleId,
  grossAmount, // subTotal
  discountAmount = 0, // itemDiscount + billDiscount
  vatAmount = 0, // taxAmount
  payments = [],
  customerId,
  branchId,
  narration = "Sales Invoice",
}) => {
  const gross = roundMoney(grossAmount);
  const discount = roundMoney(discountAmount);
  const vat = roundMoney(vatAmount);

  const netTotal = roundMoney(gross - discount + vat);

  const SYS = await resolveSystemAccounts(db);

  const entries = [];
  let paidTotal = 0;

  /* =====================
     PAYMENTS (ASSETS)
  ====================== */
  for (const p of payments) {
    const payAmount = roundMoney(p.amount || 0);
    if (payAmount <= 0) continue;

    if (!p.accountId) {
      throw new Error("Payment accountId is required");
    }

    paidTotal += payAmount;

    entries.push({
      accountId: p.accountId, // Cash / Bank / MFS
      debit: payAmount,
    });
  }

  /* =====================
     SAFETY CHECK
  ====================== */
  if (paidTotal > netTotal) {
    throw new Error("Paid amount exceeds invoice total");
  }

  /* =====================
     CUSTOMER RECEIVABLE
  ====================== */
  const dueAmount = roundMoney(netTotal - paidTotal);
  if (dueAmount > 0) {
    entries.push({
      accountId: SYS.CUSTOMER_AR,
      debit: dueAmount,
      partyType: "CUSTOMER",
      partyId: customerId,
    });
  }

  /* =====================
     DISCOUNT (EXPENSE)
  ====================== */
  if (discount > 0) {
    entries.push({
      accountId: SYS.DISCOUNT_EXPENSE, // ✅ from resolver
      debit: discount,
    });
  }

  /* =====================
     SALES INCOME (GROSS)
  ====================== */
  entries.push({
    accountId: SYS.SALES_INCOME,
    credit: gross,
  });

  /* =====================
     VAT / TAX PAYABLE
  ====================== */
  if (vat > 0) {
    entries.push({
      accountId: SYS.TAX_PAYABLE, // ✅ VAT payable
      credit: vat,
    });
  }

  return postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "SALE",
    refId: saleId,
    narration,
    entries,
    branchId,
  });
};

/* ======================================================
   SALES COGS ACCOUNTING (FIFO)
====================================================== */
export const salesCogsAccounting = async ({
  db,
  session,
  saleId,
  cogsAmount,
  branchId,
  narration = "COGS for Sales Invoice",
}) => {
  const amount = roundMoney(cogsAmount);
  if (amount <= 0) return;

  const SYS = await resolveSystemAccounts(db);

  const entries = [
    {
      accountId: SYS.COGS, // 🔥 Cost of Goods Sold
      debit: amount,
    },
    {
      accountId: SYS.INVENTORY, // 🔥 Inventory Asset
      credit: amount,
    },
  ];

  return postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "SALE_COGS",
    refId: saleId,
    narration,
    entries,
    branchId,
  });
};

/* ======================================================
   SALES RETURN ACCOUNTING (V2 - SAFE & FLEXIBLE)
====================================================== */
export const salesReturnAccounting = async ({
  db,
  session,
  salesReturnId,
  returnGross,
  returnDiscount,
  returnVat,
  refundAmount,
  dueAdjust = 0,
  customerId,
  branchId,
  narration = "Sales Return",
}) => {
  const SYS = await resolveSystemAccounts(db);

  const entries = [];

  /* 1️⃣ Reverse Sales (Contra Income) */
  entries.push({
    accountId: SYS.SALES_INCOME,
    debit: returnGross,
  });

  /* 2️⃣ Reverse Discount (Expense ↓) */
  if (returnDiscount > 0) {
    entries.push({
      accountId: SYS.DISCOUNT_EXPENSE,
      credit: returnDiscount,
    });
  }

  /* 3️⃣ Reverse VAT */
  if (returnVat > 0) {
    entries.push({
      accountId: SYS.TAX_PAYABLE,
      debit: returnVat,
    });
  }

  /* 4️⃣ Refund Cash / Adjust AR */
  if (dueAdjust > 0) {
    entries.push({
      accountId: SYS.CUSTOMER_AR,
      credit: dueAdjust,
      partyType: "CUSTOMER",
      partyId: customerId,
    });
  } else {
    entries.push({
      accountId: SYS.CASH,
      credit: refundAmount,
    });
  }

  return postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "SALE_RETURN",
    refId: salesReturnId,
    narration,
    entries,
    branchId,
  });
};

export const salesReturnCogsAccounting = async ({
  db,
  session,
  salesReturnId,
  cogsAmount,
  branchId,
  narration = "COGS Reversal for Sales Return",
}) => {
  const amount = roundMoney(cogsAmount);
  if (amount <= 0) return;

  const SYS = await resolveSystemAccounts(db);

  const entries = [
    {
      accountId: SYS.INVENTORY,
      debit: amount,
    },
    {
      accountId: SYS.COGS,
      credit: amount,
    },
  ];

  return postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "SALE_RETURN_COGS",
    refId: salesReturnId,
    narration,
    entries,
    branchId,
  });
};

/* ======================================================
   PURCHASE ACCOUNTING V0.1
====================================================== */
export const purchaseAccounting = async ({
  db,
  session,
  purchaseId,
  totalAmount,
  paymentAccountId = null,
  cashPaid = 0,
  supplierId,
  branchId,
  narration,
}) => {
  const SYS = await resolveSystemAccounts(db);
  const dueAmount = totalAmount - cashPaid;

  if (cashPaid < 0 || dueAmount < 0) {
    throw new Error("Invalid purchase amount");
  }

  const entries = [];

  // Inventory increase
  entries.push({
    accountId: SYS.INVENTORY,
    debit: totalAmount,
  });

  // Cash
  if (cashPaid > 0) {
    entries.push({
      accountId: SYS.CASH,
      credit: cashPaid,
    });
  }

  // Supplier Due
  if (dueAmount > 0) {
    entries.push({
      accountId: SYS.SUPPLIER_AP,
      credit: dueAmount,
      partyType: "SUPPLIER",
      partyId: supplierId,
    });
  }

  return postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "PURCHASE",
    refId: purchaseId,
    narration,
    entries,
    branchId,
  });
};

/* ======================================================
   PURCHASE RETURN ACCOUNTING V0.1
====================================================== */
export const purchaseReturnAccounting = async ({
  db,
  session,
  purchaseReturnId,
  returnAmount,
  cashRefund = 0,
  dueAdjust = 0,
  supplierId,
  branchId,
  narration = "Purchase Return",
}) => {
  const total = roundMoney(returnAmount);
  const cash = roundMoney(cashRefund);
  const due = roundMoney(dueAdjust);

  if (roundMoney(cash + due) !== total) {
    throw new Error("Purchase return amount mismatch");
  }
  const SYS = await resolveSystemAccounts(db);

  const entries = [];

  entries.push({
    accountId: SYS.INVENTORY,
    credit: total,
  });

  if (cash > 0) {
    entries.push({
      accountId: SYS.CASH,
      debit: cash,
    });
  }

  if (due > 0) {
    entries.push({
      accountId: SYS.SUPPLIER_AP,
      debit: due,
      partyType: "SUPPLIER",
      partyId: supplierId,
    });
  }

  return postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "PURCHASE_RETURN",
    refId: purchaseReturnId,
    narration,
    entries,
    branchId,
  });
};

/* ======================================================
   SUPPLIER PAYMENT V0.1
====================================================== */
export const supplierPaymentAccounting = async ({
  db,
  session,
  paymentId,
  amount,
  paymentAccountId,
  supplierId,
  branchId,
  narration = "Supplier Payment",
}) => {
  const SYS = await resolveSystemAccounts(db);

  const entries = [
    {
      accountId: SYS.SUPPLIER_AP,
      debit: amount,
      partyType: "SUPPLIER",
      partyId: supplierId,
    },
    {
      accountId: paymentAccountId,
      credit: amount,
    },
  ];

  return postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "SUPPLIER_PAYMENT",
    refId: paymentId,
    narration,
    entries,
    branchId,
  });
};

/* ======================================================
   CUSTOMER PAYMENT
====================================================== */
export const customerPaymentAccounting = async ({
  db,
  session,
  paymentId,
  amount,
  paymentMethod,
  customerAccountId,
  branchId,
}) => {
  const SYS = await resolveSystemAccounts(db);

  if (!["CASH", "BANK"].includes(paymentMethod)) {
    throw new Error("Invalid payment method");
  }

  const entries = [
    {
      accountId: paymentMethod === "CASH" ? SYS.CASH : SYS.BANK,
      debit: amount,
    },
    { accountId: customerAccountId, credit: amount },
  ];

  return postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "CUSTOMER_PAYMENT",
    refId: paymentId,
    narration: "Customer Payment",
    entries,
    branchId,
  });
};

/* ======================================================
   SALARY ACCRUAL (BRANCH MONTHLY REQUEST)
====================================================== */

export const salaryAccrualAccounting = async ({
  db,
  session,
  salarySheetId,
  employeeId,
  amount,
  branchId,
  narration = "Monthly Salary Accrual",
}) => {
  const total = roundMoney(amount);

  if (total <= 0) {
    throw new Error("Invalid salary amount");
  }

  const SYS = await resolveSystemAccounts(db);

  const entries = [
    /* 1️⃣ Salary Expense */
    {
      accountId: SYS.SALARY_EXPENSE,
      debit: total,
    },

    /* 2️⃣ Salary Payable (Employee Wise) */
    {
      accountId: SYS.SALARY_PAYABLE,
      credit: total,
      partyType: "EMPLOYEE",
      partyId: employeeId,
    },
  ];

  return postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "SALARY_ACCRUAL",
    refId: salarySheetId,
    narration,
    entries,
    branchId,
  });
};


/* ======================================================
   SALARY PAYMENT (FINAL PAYOUT)
====================================================== */

export const salaryPaymentAccounting = async ({
  db,
  session,
  salaryPaymentId,
  employeeId,
  amount,
  paymentAccountId,
  branchId,
  narration = "Salary Payment",
}) => {
  const total = roundMoney(amount);

  if (total <= 0) {
    throw new Error("Invalid payment amount");
  }

  if (!paymentAccountId) {
    throw new Error("Payment account required");
  }

  const SYS = await resolveSystemAccounts(db);

  const entries = [
    /* 1️⃣ Reduce Salary Payable */
    {
      accountId: SYS.SALARY_PAYABLE,
      debit: total,
      partyType: "EMPLOYEE",
      partyId: employeeId,
    },

    /* 2️⃣ Cash / Bank Decrease */
    {
      accountId: paymentAccountId,
      credit: total,
    },
  ];

  return postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "SALARY_PAYMENT",
    refId: salaryPaymentId,
    narration,
    entries,
    branchId,
  });
};

 
/* ======================================================
   COMMISSION PAYMENT V0.1 
====================================================== */

export const postCommissionAccrual = async ({
  db,
  session,
  commissionId,
  employeeId,
  branchId,
  amount,
  narration = "Commission Accrual",
  date
}) => {
  const SYS = await resolveSystemAccounts(db);

  await postJournalEntry({
    db,
    session,
    branchId,
    refType: "COMMISSION_EARNED",
    refId: commissionId,
    date,
    narration,
    entries: [
      {
        accountId: SYS.COMMISSION_EXPENSE,
        debit: amount
      },
      {
        accountId: SYS.COMMISSION_PAYABLE,
        credit: amount,
        partyId: employeeId,
        partyType: "EMPLOYEE"
      }
    ]
  });
};

export const payCommission = async ({
  db,
  session,
  employeeId,
  amount,
  paymentAccountId,
  branchId,
  paymentDate
}) => {
  const SYS = await resolveSystemAccounts(db);

  await postJournalEntry({
    db,
    session,
    branchId,
    refType: "COMMISSION_PAYMENT",
    refId: employeeId,
    date: paymentDate,
    entries: [
      {
        accountId: SYS.COMMISSION_PAYABLE,
        debit: amount,
        partyId: employeeId,
        partyType: "EMPLOYEE"
      },
      {
        accountId: paymentAccountId,
        credit: amount
      }
    ]
  });

  await db.collection("commission_ledgers").updateMany(
    {
      employeeId: new ObjectId(employeeId),
      payoutStatus: "UNPAID"
    },
    {
      $inc: { paidAmount: amount },
      $set: { payoutStatus: "PAID", updatedAt: new Date() }
    },
    { session }
  );
};

export const commissionPaymentAccounting = async ({
  db,
  session,
  commissionId,
  payments = [],
  branchId,
  narration = "Commission Payment",
}) => {
  if (!payments.length) {
    throw new Error("Payments array is required");
  }

  const SYS = await resolveSystemAccounts(db);

  const entries = [];
  let totalPaid = 0;

  /* =====================
     ACTUAL PAYMENTS (FROM FRONTEND)
  ====================== */
  for (const p of payments) {
    const amount = Number(p.amount || 0);
    if (amount <= 0) continue;

    if (!p.accountId) {
      throw new Error("Payment accountId is required");
    }

    totalPaid += amount;

    // 🔥 Money going OUT
    entries.push({
      accountId: p.accountId, // Cash / Bank / MFS (frontend decided)
      credit: amount,
    });
  }

  if (totalPaid <= 0) {
    throw new Error("Invalid commission payment amount");
  }

  /* =====================
     COMMISSION PAYABLE (FIXED SYSTEM ACCOUNT)
  ====================== */
  entries.push({
    accountId: SYS.SALARY_PAYABLE, // 🔒 system-controlled
    debit: totalPaid, // 🔥 liability reduce
  });

  return postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "COMMISSION_PAYMENT",
    refId: commissionId,
    narration,
    entries,
    branchId,
  });
};

export const commissionAccrualAccounting = async ({
  db,
  session,
  commissionId,
  amount,
  branchId,
}) => {
  const SYS = await resolveSystemAccounts(db);

  return postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "COMMISSION_EARNED",
    refId: commissionId,
    narration: "Commission Earned",
    branchId,
    entries: [
      { accountId: SYS.COMMISSION_EXPENSE, debit: amount },
      { accountId: SYS.SALARY_PAYABLE, credit: amount },
    ],
  });
};

/* ======================================================
   INVENTORY ADJUSTMENT
====================================================== */
export const inventoryAdjustmentAccounting = async ({
  db,
  session,
  adjustmentId,
  adjustmentType,
  amount,
  reason,
  branchId,
}) => {
  const SYS = await resolveSystemAccounts(db);
  const entries = [];

  if (adjustmentType === "INCREASE") {
    entries.push(
      { accountId: SYS.INVENTORY, debit: amount },
      { accountId: SYS.OTHER_INCOME, credit: amount },
    );
  }

  if (adjustmentType === "DECREASE") {
    entries.push(
      { accountId: SYS.PURCHASE_EXPENSE, debit: amount },
      { accountId: SYS.INVENTORY, credit: amount },
    );
  }

  return postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "INVENTORY_ADJUSTMENT",
    refId: adjustmentId,
    narration: reason || "Inventory Adjustment",
    entries,
    branchId,
  });
};

/* ======================================================
   OPENING BALANCE V0.1
====================================================== */
export const openingBalanceAccounting = async ({
  db,
  session,
  openingDate,
  amount,
  branchId,
  narration = "Opening Balance Owner Equity",
}) => {
  const openingAmount = roundMoney(amount);

  if (openingAmount <= 0) {
    throw new Error("Opening balance amount must be greater than zero");
  }

  // 🔑 Resolve system accounts (GLOBAL COA)
  const SYS = await resolveSystemAccounts(db);

  const entries = [
    {
      accountId: SYS.CASH, // 💵 Business Cash
      debit: openingAmount,
    },
    {
      accountId: SYS.OWNER_CAPITAL, // 👤 Owner Equity
      credit: openingAmount,
    },
  ];

  return postJournalEntry({
    db,
    session,
    date: openingDate,
    refType: "OPENING_BALANCE",
    refId: null,
    narration,
    entries,
    branchId,
  });
};
