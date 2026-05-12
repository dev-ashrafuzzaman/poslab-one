import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../../../database/collections.js";

const getAgingBucket = (days) => {
  if (days <= 30) return "0-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  return "90+";
};

/* ---------- Helpers ---------- */
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTime = (d) =>
  new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const formatBalance = (v) => ({
  amount: Math.abs(v),
  type: v >= 0 ? "DR" : "CR",
});

const getStatus = (balance, invoiceAmount) => {
  if (balance === 0) return "PAID";
  if (Math.abs(balance) < invoiceAmount) return "PARTIAL";
  return "DUE";
};
/* ---------- MAIN ---------- */

export const partyLedgerStatementReport = async ({
  db,
  partyId,
  fromDate,
  toDate,
}) => {

  const partyObjectId = new ObjectId(partyId);

  /* ================= PARTY ================= */

  const party = await db
    .collection("suppliers")
    .findOne(
      { _id: partyObjectId },
      { projection: { name: 1, code: 1 } }
    );

  /* ================= MATCH ================= */

  const match = {
    partyId: partyObjectId,
  };

  if (fromDate || toDate) {

    match.date = {};

    if (fromDate) match.date.$gte = new Date(fromDate);

    if (toDate) match.date.$lte = new Date(toDate);

  }

  /* ================= OPENING BALANCE ================= */

  let openingBalance = 0;

  if (fromDate) {

    const opening = await db.collection("ledgers").aggregate([

      {
        $match: {
          partyId: partyObjectId,
          date: { $lt: new Date(fromDate) }
        }
      },

      {
        $group: {
          _id: null,
          balance: {
            $sum: {
              $subtract: ["$debit", "$credit"]
            }
          }
        }
      }

    ]).toArray();

    openingBalance = opening[0]?.balance || 0;

  }

  /* ================= LEDGER ================= */

  const ledgers = await db
    .collection("ledgers")
    .find(match)
    .sort({ date: 1, createdAt: 1 })
    .toArray();

  let runningBalance = openingBalance;

  let totalDebit = 0;
  let totalCredit = 0;

  const rows = ledgers.map((l, i) => {

    totalDebit += l.debit || 0;
    totalCredit += l.credit || 0;

    runningBalance += (l.debit || 0) - (l.credit || 0);

    return {

      sl: i + 1,

      date: new Date(l.date).toLocaleDateString(),

      voucherNo: l.voucherNo || l.refId || "-",

      description: l.narration || l.refType || "-",

      debit: l.debit || 0,

      credit: l.credit || 0,

      runningBalance: formatBalance(runningBalance),

    };

  });

  /* ================= RESPONSE ================= */

  return {

    party: {
      name: party?.name || "-",
      code: party?.code || "-",
    },

    period: {
      from: fromDate
        ? new Date(fromDate).toLocaleDateString()
        : "Beginning",

      to: toDate
        ? new Date(toDate).toLocaleDateString()
        : "Till Date",
    },

    summary: {

      openingBalance: formatBalance(openingBalance),

      totalDebit,

      totalCredit,

      closingBalance: formatBalance(runningBalance),

    },

    rows,

  };

};

export const partyStatementReport = async ({
  db,
  partyId,
  fromDate,
  toDate,
  branchId,
  user,
}) => {
  const partyObjectId = new ObjectId(partyId);

  /* ---------- USERS ---------- */
  const userInfo = await db
    .collection("users")
    .findOne({ _id: new ObjectId(user.id) });
  /* ---------- PARTY ---------- */
  const party = await db
    .collection("suppliers")
    .findOne(
      { _id: partyObjectId },
      { projection: { name: 1, code: 1, contact: 1 } },
    );

  /* ---------- OPENING BALANCE ---------- */
  let openingBalance = 0;

  if (fromDate) {
    const openingAgg = await db
      .collection("ledgers")
      .aggregate([
        {
          $match: {
            partyId: partyObjectId,
            ...(branchId && { branchId: new ObjectId(branchId) }),
            date: { $lt: new Date(fromDate) },
          },
        },
        {
          $group: {
            _id: null,
            balance: { $sum: { $subtract: ["$debit", "$credit"] } },
          },
        },
      ])
      .toArray();

    openingBalance = openingAgg[0]?.balance || 0;
  }

  let runningBalance = openingBalance;

  /* ---------- ROW MATCH ---------- */
  const match = {
    partyId: partyObjectId,
    ...(branchId && { branchId: new ObjectId(branchId) }),
  };

  if (fromDate || toDate) {
    match.date = {};
    if (fromDate) match.date.$gte = new Date(fromDate);
    if (toDate) match.date.$lte = new Date(toDate);
  }

  /* ---------- ROWS ---------- */
  const rows = await db
    .collection("ledgers")
    .find(match)
    .sort({ date: 1, createdAt: 1 })
    .toArray();

  let totalDebit = 0;
  let totalCredit = 0;

  const statementRows = rows.map((r, i) => {
    totalDebit += r.debit || 0;
    totalCredit += r.credit || 0;

    runningBalance += (r.debit || 0) - (r.credit || 0);

    return {
      sl: i + 1,
      date: formatDate(r.date),
      time: formatTime(r.date),
      voucherType: r.refType,
      voucherNo: r.narration,
      description: r.narration,
      debit: r.debit || 0,
      credit: r.credit || 0,
      runningBalance: formatBalance(runningBalance),
    };
  });

  /* ---------- FINAL ---------- */
  return {
    success: true,

    meta: {
      statementType: "PARTY_STATEMENT",
      printable: true,
      generatedAt: new Date().toLocaleString("en-GB"),
      generatedBy: {
        id: userInfo?._id || null,
        name: userInfo?.name || "System",
      },
      currency: "BDT",
      timezone: "Asia/Dhaka",
    },

    party: {
      partyType: "SUPPLIER",
      partyId,
      code: party?.code,
      name: party?.name,
      contact: party?.contact,
    },

    period: {
      from: fromDate ? formatDate(fromDate) : "Beginning",
      to: toDate ? formatDate(toDate) : "Till Date",
    },

    summary: {
      openingBalance: formatBalance(openingBalance),
      totalDebit,
      totalCredit,
      closingBalance: formatBalance(runningBalance),
    },

    rows: statementRows,

    footer: {
      note: "System generated statement. No signature required.",
      preparedBy: "ERP Accounting Engine",
    },
  };
};

export const partyInvoiceStatementReport = async ({
  db,
  partyId,
  fromDate,
  toDate,
  branchId,
  user,
  limit = 50,
  skip = 0,
}) => {
  const partyObjectId = new ObjectId(partyId);

  /* ---------- PARTY ---------- */
  const party = await db
    .collection(COLLECTIONS.SUPPLIERS)
    .findOne(
      { _id: partyObjectId },
      { projection: { name: 1, code: 1, contact: 1 } },
    );

  if (!party) throw new Error("Supplier not found");

  /* ---------- MATCH ---------- */
  const match = {
    partyId: partyObjectId,
    ...(branchId && { branchId: new ObjectId(branchId) }),
  };

  if (fromDate || toDate) {
    match.date = {};
    if (fromDate) match.date.$gte = new Date(fromDate);
    if (toDate) match.date.$lte = new Date(toDate);
  }

  /* ---------- AGGREGATE (INVOICE + PAYMENT + RETURN) ---------- */
  const invoices = await db
    .collection(COLLECTIONS.LEDGERS)
    .aggregate([
      { $match: match },

      {
        $group: {
          _id: "$refId",
          invoiceNo: { $first: "$narration" },
          refType: { $first: "$refType" },
          invoiceDate: { $min: "$date" },

          totalDebit: { $sum: "$debit" },
          totalCredit: { $sum: "$credit" },
        },
      },

      {
        $addFields: {
          balance: { $subtract: ["$totalDebit", "$totalCredit"] },
          invoiceAmount: {
            $max: ["$totalDebit", "$totalCredit"],
          },
        },
      },

      { $sort: { invoiceDate: 1 } },
      { $skip: skip },
      { $limit: limit },
    ])
    .toArray();

  /* ---------- TOTALS + AGING ---------- */
  let grandDebit = 0;
  let grandCredit = 0;

  const aging = { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
  const today = new Date();

  const rows = invoices.map((inv, i) => {
    grandDebit += inv.totalDebit;
    grandCredit += inv.totalCredit;

    const days = (today - new Date(inv.invoiceDate)) / (1000 * 60 * 60 * 24);
    const bucket = getAgingBucket(days);
    aging[bucket] += Math.abs(inv.balance);

    return {
      sl: skip + i + 1,
      invoiceId: inv._id,
      invoiceNo: inv.invoiceNo,
      voucherType: inv.refType,
      invoiceDate: formatDate(inv.invoiceDate),

      invoiceAmount: inv.invoiceAmount,
      debit: inv.totalDebit,
      credit: inv.totalCredit,

      balance: formatBalance(inv.balance),
      status: getStatus(inv.balance, inv.invoiceAmount),
      agingBucket: bucket,
    };
  });

  /* ---------- FINAL ---------- */
  return {
    success: true,

    meta: {
      statementType: "INVOICE_WISE_PARTY_STATEMENT",
      printable: true,
      pagination: { skip, limit },
      generatedAt: new Date().toLocaleString("en-GB"),
      generatedBy: {
        id: user?._id || null,
        name: user?.name || "System",
      },
      currency: "BDT",
      timezone: "Asia/Dhaka",
    },

    party: {
      partyType: "SUPPLIER",
      partyId,
      code: party.code,
      name: party.name,
      contact: party.contact,
    },

    period: {
      from: fromDate ? formatDate(fromDate) : "Beginning",
      to: toDate ? formatDate(toDate) : "Till Date",
    },

    summary: {
      totalInvoices: rows.length,
      totalDebit: grandDebit,
      totalCredit: grandCredit,
      netBalance: formatBalance(grandDebit - grandCredit),
      agingSummary: aging,
    },

    rows,

    footer: {
      note: "Invoice wise system generated statement.",
      preparedBy: "ERP Accounting Engine",
    },
  };
};

/* ================= MAIN ================= */

export const enhancedPartyStatementReport = async ({
  db,
  partyId,
  partyType = "SUPPLIER", // SUPPLIER | CUSTOMER
  fromDate,
  toDate,
  branchId,
  user,
  limit = 1000,
  skip = 0,
}) => {
  const partyObjectId = new ObjectId(partyId);

  const partyCollection = partyType === "CUSTOMER" ? "customers" : "suppliers";

  const partyAccountType =
    partyType === "CUSTOMER" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE";

  /* ================= PARTY ================= */
  const party = await db
    .collection(partyCollection)
    .findOne(
      { _id: partyObjectId },
      { projection: { name: 1, code: 1, contact: 1 } },
    );

  if (!party) throw new Error("Party not found");

  /* ================= OPENING BALANCE ================= */
  let openingBalance = 0;

  if (fromDate) {
    const openingAgg = await db
      .collection("ledgers")
      .aggregate([
        {
          $match: {
            partyId: partyObjectId,
            ...(branchId && { branchId: new ObjectId(branchId) }),
            date: { $lt: new Date(fromDate) },
          },
        },
        {
          $group: {
            _id: null,
            balance: { $sum: { $subtract: ["$debit", "$credit"] } },
          },
        },
      ])
      .toArray();

    openingBalance = openingAgg[0]?.balance || 0;
  }

  let runningBalance = openingBalance;

  /* ================= ROW MATCH ================= */
  const match = {
    partyId: partyObjectId,
    ...(branchId && { branchId: new ObjectId(branchId) }),
  };

  if (fromDate || toDate) {
    match.date = {};
    if (fromDate) match.date.$gte = new Date(fromDate);
    if (toDate) match.date.$lte = new Date(toDate);
  }

  /* ================= LEDGER ROWS ================= */
  const ledgers = await db
    .collection("ledgers")
    .find(match)
    .sort({ date: 1, createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  let totalDebit = 0;
  let totalCredit = 0;

  const rows = [];

  /* ---- Opening row ---- */
  rows.push({
    sl: "-",
    date: fromDate ? formatDate(fromDate) : "",
    time: "",
    voucherType: "",
    voucherNo: "",
    description: "Opening Balance",
    debit: "",
    credit: "",
    runningBalance: formatBalance(openingBalance),
    rowType: "OPENING",
  });

  ledgers.forEach((r, i) => {
    totalDebit += r.debit || 0;
    totalCredit += r.credit || 0;

    runningBalance += (r.debit || 0) - (r.credit || 0);

    rows.push({
      sl: i + 1,
      date: formatDate(r.date),
      time: formatTime(r.date),
      voucherType: r.refType,
      voucherNo: r.voucherNo || r.narration,
      description: r.narration,
      debit: r.debit || 0,
      credit: r.credit || 0,
      runningBalance: formatBalance(runningBalance),
      refId: r.refId,
      rowType: "TRANSACTION",
    });
  });

  /* ================= INVOICE WISE SUMMARY ================= */
  const invoices = await db
    .collection("ledgers")
    .aggregate([
      { $match: match },
      {
        $group: {
          _id: "$refId",
          refType: { $first: "$refType" },
          invoiceNo: { $first: "$voucherNo" },
          invoiceDate: { $min: "$date" },
          totalDebit: { $sum: "$debit" },
          totalCredit: { $sum: "$credit" },
        },
      },
      {
        $addFields: {
          balance: { $subtract: ["$totalDebit", "$totalCredit"] },
        },
      },
      { $sort: { invoiceDate: 1 } },
    ])
    .toArray();

  /* ================= AGING ================= */
  const aging = {
    "0-30": 0,
    "31-60": 0,
    "61-90": 0,
    "90+": 0,
  };

  const today = new Date();

  const invoiceRows = invoices.map((inv, i) => {
    const days = (today - new Date(inv.invoiceDate)) / (1000 * 60 * 60 * 24);

    const bucket = getAgingBucket(days);

    aging[bucket] += Math.abs(inv.balance);

    let status = "PAID";
    if (inv.balance !== 0) {
      status =
        Math.abs(inv.balance) === Math.abs(inv.totalDebit || inv.totalCredit)
          ? "DUE"
          : "PARTIAL";
    }

    return {
      sl: i + 1,
      invoiceId: inv._id,
      invoiceNo: inv.invoiceNo,
      voucherType: inv.refType,
      invoiceDate: formatDate(inv.invoiceDate),
      invoiceAmount: inv.totalDebit || inv.totalCredit,
      debit: inv.totalDebit,
      credit: inv.totalCredit,
      balance: formatBalance(inv.balance),
      status,
      agingBucket: bucket,
    };
  });

  /* ================= FINAL ================= */
  return {
    success: true,

    meta: {
      statementType: "ENHANCED_PARTY_STATEMENT",
      partyType,
      printable: true,
      pagination: { skip, limit },
      generatedAt: new Date().toLocaleString("en-GB"),
      generatedBy: {
        id: user?._id || null,
        name: user?.name || "System",
      },
      currency: "BDT",
      timezone: "Asia/Dhaka",
    },

    party: {
      partyId,
      code: party.code,
      name: party.name,
      contact: party.contact,
      accountPerspective: partyAccountType,
    },

    period: {
      from: fromDate ? formatDate(fromDate) : "Beginning",
      to: toDate ? formatDate(toDate) : "Till Date",
    },

    summary: {
      openingBalance: formatBalance(openingBalance),
      totalDebit,
      totalCredit,
      closingBalance: formatBalance(runningBalance),
    },

    agingSummary: aging,

    rows,
    invoiceWise: {
      totalInvoices: invoiceRows.length,
      rows: invoiceRows,
    },

    footer: {
      note: "System generated enhanced party statement. No signature required.",
      preparedBy: "ERP Accounting Engine",
    },
  };
};
