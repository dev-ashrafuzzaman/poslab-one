import { ObjectId } from "mongodb";

export function buildBaseMatch(user, filters, startUTC, endUTC) {
  let branchId = user.branchId;

  if (["Admin", "Super Admin"].includes(user.roleName)) {
    branchId = filters.branchId;
  }

  return {
    branchId: new ObjectId(branchId),
    createdAt: { $gte: startUTC, $lte: endUTC },
  };
}

export function productPipeline(baseMatch) {
  return [
    { $match: baseMatch },

    {
      $lookup: {
        from: "sale_items",
        localField: "_id",
        foreignField: "saleId",
        as: "items",
      },
    },
    { $unwind: "$items" },

    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    {
      $group: {
        _id: "$items.productId",
        name: { $first: "$product.name" },
        totalQty: { $sum: "$items.qty" },
        totalRevenue: { $sum: "$items.lineTotal" },
      },
    },

    { $sort: { totalRevenue: -1 } },
  ];
}

export function invoicePipeline(baseMatch) {
  return [
    { $match: baseMatch },

    {
      $lookup: {
        from: "employees",
        localField: "salesmanId",
        foreignField: "_id",
        as: "salesman",
      },
    },
    { $unwind: { path: "$salesman", preserveNullAndEmptyArrays: true } },

    {
      $project: {
        invoiceNo: 1,
        createdAt: 1,
        grandTotal: 1,
        returnedAmount: { $ifNull: ["$returnedAmount", 0] },
        netSale: {
          $subtract: ["$grandTotal", { $ifNull: ["$returnedAmount", 0] }],
        },
        salesmanName: "$salesman.name",
        status: 1,
      },
    },
  ];
}