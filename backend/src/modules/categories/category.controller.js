import { ObjectId } from "mongodb";
import { formatDocuments } from "../../utils/formatedDocument.js";
import { getDB } from "../../config/db.js";

export const getCategories = () => {
  return async (req, res, next) => {
    try {
      const db = getDB();

      const page = Math.max(+req.query.page || 1, 1);
      const limit = Math.min(+req.query.limit || 10, 100);
      const skip = (page - 1) * limit;

      const sortField = req.query.sortBy || "createdAt";
      const sortOrder = req.query.sort === "asc" ? 1 : -1;

const filter = {};

if (req.query.status) filter.status = req.query.status;
if (req.query.level) filter.level = Number(req.query.level);

if (req.query.parentId) {
  filter.parentId = new ObjectId(req.query.parentId);
}

if (req.query.search) {
  filter.name = { $regex: req.query.search, $options: "i" };
}


      const pipeline = [
        { $match: filter },

        {
          $lookup: {
            from: "categories",
            localField: "parentId",
            foreignField: "_id",
            as: "parent",
          },
        },

        {
          $addFields: {
            parentName: {
              $cond: [
                { $eq: ["$level", 1] },
                null,
                { $arrayElemAt: ["$parent.name", 0] },
              ],
            },
          },
        },

        { $project: { parent: 0 } },
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: limit },
      ];

      const data = await db
        .collection("categories")
        .aggregate(pipeline, { allowDiskUse: true })
        .toArray();

const total = await db
  .collection("categories")
  .countDocuments(filter);


      res.json({
        success: true,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + data.length < total,
        },
        data: formatDocuments(data),
      });
    } catch (err) {
      next(err);
    }
  };
};
