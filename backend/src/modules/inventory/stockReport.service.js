import { ObjectId } from "mongodb";
import { getDB } from "../../config/db.js";

export async function buildStockReport({ user, filters }) {
  const db = getDB();

  /* =====================================================
     1️⃣ RBAC BRANCH RESOLUTION
  ===================================================== */

  let branchId = user.branchId;

  if (["Super Admin", "Admin"].includes(user.roleName)) {
    if (!filters.branchId) throw new Error("Branch required");
    branchId = filters.branchId;
  }

  const pipeline = [];

  /* =====================================================
     2️⃣ BASE MATCH
  ===================================================== */

  const match = {
    branchId: new ObjectId(branchId),
  };

  if (filters.productId)
    match.productId = new ObjectId(filters.productId);

  if (filters.variantId)
    match.variantId = new ObjectId(filters.variantId);

  pipeline.push({ $match: match });

  /* =====================================================
     3️⃣ VARIANT LOOKUP
  ===================================================== */

  pipeline.push(
    {
      $lookup: {
        from: "product_variants",
        localField: "variantId",
        foreignField: "_id",
        as: "variant",
      },
    },
    {
      $unwind: {
        path: "$variant",
        preserveNullAndEmptyArrays: true,
      },
    }
  );

  /* =====================================================
     4️⃣ PRODUCT LOOKUP
  ===================================================== */

  pipeline.push(
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: {
        path: "$product",
        preserveNullAndEmptyArrays: true,
      },
    }
  );

  /* =====================================================
     5️⃣ PRODUCT TYPE FILTER
  ===================================================== */

  if (filters.productTypeId) {
    pipeline.push({
      $match: {
        "product.productTypeId": new ObjectId(filters.productTypeId),
      },
    });
  }

  /* =====================================================
     6️⃣ CATEGORY FILTER
  ===================================================== */

  if (filters.categorySubId) {
    pipeline.push({
      $match: {
        "product.categoryId": new ObjectId(filters.categorySubId),
      },
    });
  }

  /* =====================================================
     7️⃣ PRODUCT TYPE LOOKUP
  ===================================================== */

  pipeline.push(
    {
      $lookup: {
        from: "product_types",
        localField: "product.productTypeId",
        foreignField: "_id",
        as: "productType",
      },
    },
    {
      $unwind: {
        path: "$productType",
        preserveNullAndEmptyArrays: true,
      },
    }
  );

  /* =====================================================
     8️⃣ SUB CATEGORY LOOKUP
  ===================================================== */

  pipeline.push(
    {
      $lookup: {
        from: "categories",
        localField: "product.categoryId",
        foreignField: "_id",
        as: "subCategory",
      },
    },
    {
      $unwind: {
        path: "$subCategory",
        preserveNullAndEmptyArrays: true,
      },
    }
  );

  /* =====================================================
     9️⃣ MAIN CATEGORY LOOKUP
  ===================================================== */

  pipeline.push(
    {
      $lookup: {
        from: "categories",
        localField: "subCategory.parentId",
        foreignField: "_id",
        as: "mainCategory",
      },
    },
    {
      $unwind: {
        path: "$mainCategory",
        preserveNullAndEmptyArrays: true,
      },
    }
  );

  /* =====================================================
     🔟 MAIN CATEGORY FILTER
  ===================================================== */

  if (filters.categoryMainId) {
    pipeline.push({
      $match: {
        "mainCategory._id": new ObjectId(filters.categoryMainId),
      },
    });
  }

  /* =====================================================
     1️⃣1️⃣ NORMALIZED PROJECTION
  ===================================================== */

  pipeline.push({
    $project: {
      branchId: 1,
      qty: "$qty",

      sku: "$variant.sku",
      size: "$variant.attributes.size",
      color: "$variant.attributes.color",

      productId: "$product._id",
      productName: "$product.name",

      productTypeId: "$productType._id",
      productTypeName: "$productType.name",

      subCategoryId: "$subCategory._id",
      subCategoryName: "$subCategory.name",

      mainCategoryId: "$mainCategory._id",
      mainCategoryName: "$mainCategory.name",

      costPrice: "$variant.costPrice",
      salePrice: "$variant.salePrice",

      costValue: {
        $multiply: ["$qty", "$variant.costPrice"],
      },

      saleValue: {
        $multiply: ["$qty", "$variant.salePrice"],
      },

      margin: {
        $multiply: [
          "$qty",
          {
            $subtract: [
              "$variant.salePrice",
              "$variant.costPrice",
            ],
          },
        ],
      },
    },
  });

  /* =====================================================
     1️⃣2️⃣ DYNAMIC GROUP ENGINE
  ===================================================== */

  const groupBy = filters.groupBy || "variant";

  const groupMap = {
    category_main: {
      _id: "$mainCategoryId",
      name: { $first: "$mainCategoryName" },
    },

    category_sub: {
      _id: "$subCategoryId",
      name: { $first: "$subCategoryName" },
    },

    product_type: {
      _id: "$productTypeId",
      name: { $first: "$productTypeName" },
    },

    product: {
      _id: "$productId",
      name: { $first: "$productName" },
    },

    variant: {
      _id: "$sku",
      sku: { $first: "$sku" },
      size: { $first: "$size" },
      color: { $first: "$color" },
    },
  };

  pipeline.push({
    $group: {
      ...groupMap[groupBy],

      totalQty: { $sum: "$qty" },
      totalCost: { $sum: "$costValue" },
      totalSale: { $sum: "$saleValue" },
      totalMargin: { $sum: "$margin" },
    },
  });

  /* =====================================================
     1️⃣3️⃣ SORT
  ===================================================== */

  pipeline.push({
    $sort: { totalQty: -1 },
  });

  /* =====================================================
     1️⃣4️⃣ EXECUTE
  ===================================================== */

  const rows = await db.collection("stocks").aggregate(pipeline).toArray();

  return rows
}