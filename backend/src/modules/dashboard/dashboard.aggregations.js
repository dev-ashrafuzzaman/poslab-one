import { ObjectId } from "mongodb";

export const getSummary = async (db, branchId, from, to) => {
  const match = {
    status: "COMPLETED",
  };

  if (branchId) {
    match.branchId = new ObjectId(branchId);
  }

  if (from && to) {
    match.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  const [sales] = await db
    .collection("sales")
    .aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$grandTotal" },
          orders: { $sum: 1 },
          totalDue: { $sum: "$dueAmount" },
        },
      },
    ])
    .toArray();

  const productsPromise = db.collection("products").countDocuments();
  const customersPromise = db.collection("customers").countDocuments();

  const [products, customers] = await Promise.all([
    productsPromise,
    customersPromise,
  ]);

  return {
    revenue: { value: sales?.revenue || 0 },
    orders: { value: sales?.orders || 0 },
    due: { value: sales?.totalDue || 0 },
    products: { value: products },
    customers: { value: customers },
  };
};


export const getSalesChart = async (db, branchId, from, to) => {
  const match = { status: "COMPLETED" };

  if (branchId) {
    match.branchId = new ObjectId(branchId);
  }

  if (from && to) {
    match.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  return db.collection("sales").aggregate([
    { $match: match },

    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        sales: { $sum: "$grandTotal" },
        orders: { $sum: 1 },
      },
    },

    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
        },
        sales: 1,
        orders: 1,
      },
    },

    { $sort: { date: 1 } },
  ]).toArray();
};

export const getLowStock = async (db, branchId) => {
  const match = {};

  if (branchId) {
    match.branchId = new ObjectId(branchId);
  }

  return db.collection("stocks").aggregate([
    { $match: match },

    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    {
      $lookup: {
        from: "product_variants",
        localField: "variantId",
        foreignField: "_id",
        as: "variant",
      },
    },
    { $unwind: "$variant" },

    {
      $addFields: {
        reorderLevel: {
          $ifNull: ["$product.reorderLevel", 3],
        },
      },
    },

    {
      $match: {
        $expr: { $lte: ["$qty", "$reorderLevel"] },
      },
    },

    {
      $project: {
        name: "$product.name",
        sku: "$variant.sku",
        stock: "$qty",
        threshold: "$reorderLevel",
        category: "$product.category",
      },
    },

    { $sort: { stock: 1 } },

    { $limit: 5 },
  ]).toArray();
};

export const getRecentTransactions = async (db, branchId, from, to) => {
  const match = { status: "COMPLETED" };

  if (branchId) {
    match.branchId = new ObjectId(branchId);
  }

  if (from && to) {
    match.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  return db.collection("sales").aggregate([
    { $match: match },

    { $sort: { createdAt: -1 } },

    { $limit: 5 },

    {
      $project: {
        _id: 0,
        id: "$invoiceNo",
        customerId: 1,
        amount: "$grandTotal",
        items: "$totalQty",
        status: 1,
        createdAt: 1,
      },
    },
  ]).toArray();
};

export const getPerformanceMetrics = async (
  db,
  branchId,
  from,
  to
) => {
  const match = { status: "COMPLETED" };

  if (branchId) {
    match.branchId = new ObjectId(branchId);
  }

  if (from && to) {
    match.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  const [result] = await db.collection("sales").aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        orders: { $sum: 1 },
        revenue: { $sum: "$grandTotal" },
        items: { $sum: "$totalQty" },
      },
    },
  ]).toArray();

  if (!result) {
    return {
      avgOrder: 0,
      itemsPerOrder: 0,
    };
  }

  return {
    avgOrder: result.revenue / result.orders,
    itemsPerOrder: result.items / result.orders,
  };
};
