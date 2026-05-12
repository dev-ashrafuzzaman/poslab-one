// membership.service.js
import { ObjectId } from "mongodb";
import { getDB } from "../../config/db.js";
import { generateCode } from "../../utils/codeGenerator.js";
import { COLLECTIONS } from "../../database/collections.js";

export async function createMembership({
  customerId,
  branchId,
  userId,
  session,
}) {
  const db = getDB();

  // ❌ Prevent duplicate membership
  const existing = await db
    .collection(COLLECTIONS.MEMBERSHIPS)
    .findOne({ customerId: new ObjectId(customerId) }, { session });
  const branch = await db
    .collection(COLLECTIONS.BRANCHES)
    .findOne({ _id: new ObjectId(branchId) }, { session });

  if (!branch) {
    throw new Error("Only Branch User Access / Not Found");
  }
  if (existing) {
    throw new Error("Membership already exists");
  }

  // ✅ Generate unique membership code
  const memberCode = await generateCode({
    db,
    module: "MEMBERSHIP",
    prefix: "MEM",
    scope: "YEAR",
    branch: branch.code,
    session,
  });

  const doc = {
    customerId: new ObjectId(customerId),
    branchId: new ObjectId(branchId),
    memberCode,
    status: "PENDING",
    createdAt: new Date(),
    createdBy: new ObjectId(userId),
  };

  const res = await db
    .collection(COLLECTIONS.MEMBERSHIPS)
    .insertOne(doc, { session });

  return res.insertedId;
}

export async function getMemberships({
  branchId,
  search,
  page = 1,
  limit = 20,
}) {
  const db = getDB();

  const match = {};

  // Branch Manager → own branch
  if (branchId) {
    match.branchId = new ObjectId(branchId);
  }

  // Search (member code / customer phone / name)
  if (search) {
    match.$or = [{ memberCode: { $regex: search, $options: "i" } }];
  }

  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: match },

    /* 🔗 Join Customer */
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: "$customer" },

    /* 🔗 Join Branch */
    {
      $lookup: {
        from: "branches",
        localField: "branchId",
        foreignField: "_id",
        as: "branch",
      },
    },
    { $unwind: "$branch" },

    /* 📦 Shape Data */
    {
      $project: {
        _id: 1,
        code: "$memberCode",
        status: 1,
        createdAt: 1,
        customerId: "$customerId",
        name: "$customer.name",
        phone: "$customer.phone",
        address: "$customer.address",
        branchName: "$branch.name",
        branchCode: "$branch.code",
      },
    },

    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const data = await db
    .collection(COLLECTIONS.MEMBERSHIPS)
    .aggregate(pipeline)
    .toArray();

  const total = await db
    .collection(COLLECTIONS.MEMBERSHIPS)
    .countDocuments(match);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export const updateLoyaltySettings = async (req, res) => {
  const db = getDB();

  const payload = {
    productDiscountPercent: Number(req.body.productDiscountPercent || 0),
    maxRewardValue: Number(req.body.maxRewardValue || 0),
    minActivationAmount: Number(req.body.minActivationAmount || 0),
    minDailyPurchase: Number(req.body.minDailyPurchase || 0),
    requiredCount: Number(req.body.requiredCount || 0),

    status: req.body.status || "ACTIVE",
    updatedAt: new Date(),
  };

  await db
    .collection("loyalty_settings")
    .updateOne({ status: "ACTIVE" }, { $set: payload });

  res.json({
    success: true,
    message: "Loyalty settings updated",
  });
};

export const getMembershipOverview = async (customerId) => {
  const db = getDB();
  const cid = new ObjectId(customerId);

  /* =====================================================
     CUSTOMER
  ====================================================== */
  const customer = await db.collection("customers").findOne(
    { _id: cid },
    {
      projection: {
        name: 1,
        phone: 1,
        code: 1,
        status: 1,
        loyaltyPoints: 1,
        dueBalance: 1,
        advanceBalance: 1,
        createdAt: 1,
      },
    }
  );

  if (!customer) return null;

  /* =====================================================
     MEMBERSHIP
  ====================================================== */
  const membership = await db.collection("memberships").findOne({
    customerId: cid,
    status: "ACTIVE",
  });

  /* =====================================================
     LOYALTY SETTINGS (GLOBAL)
  ====================================================== */
  const settings = await db.collection("loyalty_settings").findOne({
    status: "ACTIVE",
  });

  /* =====================================================
     CUSTOMER → BRANCH USAGE
  ====================================================== */
  const branches = await db
    .collection("customer_branches")
    .find(
      { customerId: cid },
      {
        projection: {
          branchId: 1,
          branchName: 1,
          firstUsedAt: 1,
          lastUsedAt: 1,
        },
      }
    )
    .sort({ lastUsedAt: -1 })
    .toArray();

  /* =====================================================
     INVOICE LIST (CROSS-BRANCH)
  ====================================================== */
  const invoices = await db
    .collection("sales")
    .aggregate([
      {
        $match: {
          customerId: cid,
          status: "COMPLETED",
        },
      },

      /* 🔗 JOIN BRANCH */
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: "$branch" },

      /* 📦 SHAPE DATA */
      {
        $project: {
          _id: 1,
          invoiceNo: 1,
          createdAt: 1,
          branchName: "$branch.name",

          subTotal: 1,
          itemDiscount: { $ifNull: ["$itemDiscount", 0] },
          billDiscount: { $ifNull: ["$billDiscount", 0] },
          grandTotal: 1,

          totalDiscountGain: {
            $add: [
              { $ifNull: ["$itemDiscount", 0] },
              { $ifNull: ["$billDiscount", 0] },
            ],
          },
        },
      },

      { $sort: { createdAt: -1 } },
      { $limit: 20 },
    ])
    .toArray();

  /* =====================================================
     PURCHASE SUMMARY (LIFETIME)
  ====================================================== */
  const [purchaseSummary] = await db
    .collection("sales")
    .aggregate([
      {
        $match: {
          customerId: cid,
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalSpent: { $sum: "$grandTotal" },
          totalItemDiscount: {
            $sum: { $ifNull: ["$itemDiscount", 0] },
          },
          totalBillDiscount: {
            $sum: { $ifNull: ["$billDiscount", 0] },
          },
          lastPurchaseAt: { $max: "$createdAt" },
        },
      },
    ])
    .toArray();

  /* =====================================================
     LOYALTY CYCLE (CURRENT)
  ====================================================== */
  const cycle =
    membership &&
    (await db.collection("loyalty_cycles").findOne({
      memberId: membership._id,
      status: "RUNNING",
    }));

  const loyalty = cycle
    ? {
        cycleNo: cycle.cycleNo,
        current: cycle.currentCount,
        required: cycle.requiredCount,
        remaining: cycle.requiredCount - cycle.currentCount,
        status: cycle.status,
        startedAt: cycle.startedAt,
      }
    : null;

  /* =====================================================
     FINAL RESPONSE
  ====================================================== */
  return {
    customer,

    membership,

    branches,

    loyalty,

    settings,

    purchases: {
      summary: {
        totalInvoices: purchaseSummary?.totalInvoices || 0,
        totalSpent: purchaseSummary?.totalSpent || 0,
        totalItemDiscount: purchaseSummary?.totalItemDiscount || 0,
        totalBillDiscount: purchaseSummary?.totalBillDiscount || 0,
        totalDiscountGain:
          (purchaseSummary?.totalItemDiscount || 0) +
          (purchaseSummary?.totalBillDiscount || 0),
        lastPurchaseAt: purchaseSummary?.lastPurchaseAt || null,
      },
      invoices,
    },
  };
};


export async function getInvoices(
  customerId,
  { page = 1, limit = 10, from, to },
) {
  const db = getDB();
  const match = {
    customerId: new ObjectId(customerId),
    status: "COMPLETED",
  };

  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;

  const data = await db
    .collection("sales")
    .aggregate([
      { $match: match },
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: "$branch" },
      {
        $project: {
          invoiceNo: 1,
          createdAt: 1,
          branchName: "$branch.name",
          itemDiscount: 1,
          billDiscount: 1,
          totalDiscount: { $add: ["$itemDiscount", "$billDiscount"] },
          grandTotal: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ])
    .toArray();

  const total = await db.collection("sales").countDocuments(match);

  return {
    rows: data,
    meta: { page, limit, total },
  };
}

export async function getInvoiceItems(saleId) {
  const db = getDB();

  return db
    .collection("sale_items")
    .find(
      { saleId: new ObjectId(saleId) },
      {
        projection: {
          sku: 1,
          qty: 1,
          salePrice: 1,
          discount: 1,
          lineTotal: 1,
        },
      },
    )
    .toArray();
}

export async function getDiscountTrend(customerId) {
  const db = getDB();

  return db
    .collection("sales")
    .aggregate([
      {
        $match: {
          customerId: new ObjectId(customerId),
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          discount: {
            $sum: { $add: ["$itemDiscount", "$billDiscount"] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();
}

export async function getBranchBreakdown(customerId) {
  const db = getDB();

  return db
    .collection("sales")
    .aggregate([
      {
        $match: {
          customerId: new ObjectId(customerId),
          status: "COMPLETED",
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: "$branch" },
      {
        $group: {
          _id: "$branch.name",
          totalSpent: { $sum: "$grandTotal" },
          totalDiscount: {
            $sum: { $add: ["$itemDiscount", "$billDiscount"] },
          },
          invoices: { $sum: 1 },
        },
      },
    ])
    .toArray();
}
