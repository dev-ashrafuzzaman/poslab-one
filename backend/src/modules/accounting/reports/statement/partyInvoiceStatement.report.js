import { ObjectId } from "mongodb";

export const partyInvoiceStatementReport = async ({
  db,
  partyId,
  fromDate,
  toDate,
  branchId,
}) => {

  const partyObjectId = new ObjectId(partyId);

  const match = {
    partyId: partyObjectId,
    ...(branchId && { branchId: new ObjectId(branchId) }),
  };

  if (fromDate || toDate) {
    match.date = {};
    if (fromDate) match.date.$gte = new Date(fromDate);
    if (toDate) match.date.$lte = new Date(toDate);
  }

  /* ===========================
     GROUP BY INVOICE
  ============================ */

  const invoices = await db.collection("ledgers").aggregate([

    { $match: match },

    {
      $group: {
        _id: "$refId",

        invoiceNo: { $first: "$voucherNo" },
        invoiceDate: { $min: "$date" },

        invoiceAmount: {
          $sum: {
            $cond: [
              { $eq: ["$refType", "PURCHASE"] },
              "$credit",
              0,
            ],
          },
        },

        payment: {
          $sum: {
            $cond: [
              { $eq: ["$refType", "PAYMENT"] },
              "$debit",
              0,
            ],
          },
        },

      },
    },

    {
      $addFields: {
        balance: { $subtract: ["$invoiceAmount", "$payment"] },
      },
    },

    { $sort: { invoiceDate: 1 } },

  ]).toArray();


  /* ===========================
     AGING
  ============================ */

  const today = new Date();

  const aging = {
    "0-30": 0,
    "31-60": 0,
    "61-90": 0,
    "90+": 0,
  };

  const rows = invoices.map((inv, i) => {

    const days =
      (today - new Date(inv.invoiceDate)) /
      (1000 * 60 * 60 * 24);

    let bucket = "0-30";

    if (days > 30 && days <= 60) bucket = "31-60";
    if (days > 60 && days <= 90) bucket = "61-90";
    if (days > 90) bucket = "90+";

    aging[bucket] += inv.balance;

    return {

      sl: i + 1,

      invoiceNo: inv.invoiceNo,

      invoiceDate: new Date(inv.invoiceDate)
        .toLocaleDateString(),

      invoiceAmount: inv.invoiceAmount,

      paid: inv.payment,

      balance: inv.balance,

      agingBucket: bucket,

      status:
        inv.balance === 0
          ? "PAID"
          : inv.payment === 0
          ? "DUE"
          : "PARTIAL",
    };

  });


  return {

    success: true,

    summary: {
      totalInvoices: rows.length,

      totalAmount: rows.reduce(
        (t, r) => t + r.invoiceAmount,
        0
      ),

      totalPaid: rows.reduce(
        (t, r) => t + r.paid,
        0
      ),

      totalDue: rows.reduce(
        (t, r) => t + r.balance,
        0
      ),

      aging,
    },

    rows,

  };

};