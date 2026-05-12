import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../database/collections.js";
import { formatDocuments } from "../../utils/formatedDocument.js";
import { getDB } from "../../config/db.js";

export const getVariants = async (req, res, next) => {
  try {
    const db = getDB();

    /* ---------- Pagination ---------- */
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    /* ---------- Sorting ---------- */
    const sortField = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sort === "asc" ? 1 : -1;

    /* ---------- Filters ---------- */
    const match = {};

    if (req.query.status) {
      match.status = req.query.status;
    }

    if (req.query.productId && ObjectId.isValid(req.query.productId)) {
      match.productId = new ObjectId(req.query.productId);
    }

    /* ---------- Search ---------- */
    if (req.query.search) {
      match.$or = [
        { sku: { $regex: req.query.search, $options: "i" } },
        { "attributes.size": { $regex: req.query.search, $options: "i" } },
        { "attributes.color": { $regex: req.query.search, $options: "i" } },
      ];
    }

    /* ---------- Aggregation Pipeline ---------- */
    const pipeline = [
      /* 1️⃣ Variants */
      { $match: match },

      /* 2️⃣ Join Product */
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
      },

      /* 3️⃣ Join Sub Category (product.categoryId) */
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
      },

      /* 4️⃣ Join Parent Category (subCategory.parentId) */
      {
        $lookup: {
          from: "categories",
          localField: "subCategory.parentId",
          foreignField: "_id",
          as: "parentCategory",
        },
      },
      {
        $unwind: {
          path: "$parentCategory",
          preserveNullAndEmptyArrays: true,
        },
      },

      /* 5️⃣ Shape Final Response */
      {
        $project: {
          sku: 1,
          salePrice: 1,
          status: 1,
          attributes: 1,
          createdAt: 1,

          product: {
            _id: "$product._id",
            name: "$product.name",
          },

          category: {
            parent: {
              _id: "$parentCategory._id",
              name: "$parentCategory.name",
            },
            sub: {
              _id: "$subCategory._id",
              name: "$subCategory.name",
            },
          },
        },
      },

      { $sort: { [sortField]: sortOrder } },
      { $skip: skip },
      { $limit: limit },
    ];

    const data = await db
      .collection(COLLECTIONS.VARIANTS)
      .aggregate(pipeline)
      .toArray();

    const total = await db
      .collection(COLLECTIONS.VARIANTS)
      .countDocuments(match);

    res.json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: formatDocuments(data),
    });
  } catch (err) {
    next(err);
  }
};
