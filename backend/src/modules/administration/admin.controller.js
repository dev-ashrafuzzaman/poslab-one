import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../database/collections.js";
import { getDB } from "../../config/db.js";

export const getActivityLogs = async (req, res, next) => {
  try {
    const db = getDB();

    const {
      page = 1,
      limit = 20,
      search = "",
      action,
      refType,
      userId,
      branchId,
      dateFrom,
      dateTo,
    } = req.query;

    const match = {};

    /* ---------- Filters ---------- */
    if (action) match.action = action;
    if (refType) match.refType = refType;
    if (userId) match.userId = new ObjectId(userId);
    if (branchId) match.branchId = new ObjectId(branchId);

    if (dateFrom || dateTo) {
      match.createdAt = {};
      if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
      if (dateTo) match.createdAt.$lte = new Date(dateTo);
    }

    /* ---------- Search ---------- */
    if (search) {
      match.$or = [
        { action: { $regex: search, $options: "i" } },
        { collection: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ];
    }

    /* ---------- Aggregation ---------- */
    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          action: 1,
          refType: 1,
          refId: 1,
          collection: 1,
          status: 1,
          payload: 1,
          ipAddress: 1,
          userAgent: 1,
          createdAt: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
          },
          branch: {
            _id: "$branch._id",
            name: "$branch.name",
            code: "$branch.code",
          },
        },
      },
    ];

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      db
        .collection(COLLECTIONS.AUDIT_LOGS)
        .aggregate([...pipeline, { $skip: skip }, { $limit: Number(limit) }])
        .toArray(),
      db.collection(COLLECTIONS.AUDIT_LOGS).countDocuments(match),
    ]);

    res.json({
      success: true,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      data,
    });
  } catch (err) {
    next(err);
  }
};
