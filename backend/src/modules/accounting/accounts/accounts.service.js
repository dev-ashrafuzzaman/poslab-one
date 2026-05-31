import { getDB } from "../../../config/db.js";
import { COLLECTIONS } from "../../../database/collections.js";

export const getPaymentMethods = async (req, res, next) => {
  const db = getDB();
  const { parentCode, search = "", page = 1, limit = 20 } = req.query;

  const skip = (page - 1) * Number(limit);

  /* ----------------------------------------
   * Find parent account (e.g. 1002)
   * ---------------------------------------- */
  const parent = await db.collection(COLLECTIONS.ACCOUNTS).findOne({
    code: parentCode,
    status: "ACTIVE",
  });

  if (!parent) {
    return res.json({
      success: true,
      data: [],
      pagination: { page: 1, limit, total: 0, hasMore: false },
    });
  }

  /* ----------------------------------------
   * Base match (NON-CASH)
   * ---------------------------------------- */
  const match = {
    parentId: parent._id,
    status: "ACTIVE",
  };

  if (search) {
    match.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  /* ----------------------------------------
   * CASH condition (special)
   * ---------------------------------------- */
  const cashMatch = {
    code: "1001",
    status: "ACTIVE",
    ...(search && {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ],
    }),
  };

  /* ----------------------------------------
   * Aggregation (Cash first)
   * ---------------------------------------- */
  const pipeline = [
    {
      $match: {
        $or: [cashMatch, match],
      },
    },
    {
      $addFields: {
        __order: {
          $cond: [{ $eq: ["$code", "1001"] }, 0, 1],
        },
      },
    },
    { $sort: { __order: 1, name: 1 } },
    { $skip: skip },
    { $limit: Number(limit) },
  ];

  const data = await db
    .collection(COLLECTIONS.ACCOUNTS)
    .aggregate(pipeline)
    .toArray();

  /* ----------------------------------------
   * Total count
   * ---------------------------------------- */
  const total = await db.collection(COLLECTIONS.ACCOUNTS).countDocuments({
    $or: [cashMatch, match],
  });

  res.json({
    success: true,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      hasMore: skip + data.length < total,
    },
    data,
  });
};
