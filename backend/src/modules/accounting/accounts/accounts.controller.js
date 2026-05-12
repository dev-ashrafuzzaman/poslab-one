// modules/accounting/accounts/accounts.controller.js
import { ObjectId } from "mongodb";
import { getDB } from "../../../config/db.js";
import { formatDocuments } from "../../../utils/formatedDocument.js";
import { getAccountBalance } from "./accountBalance.service.js";

export const createAccount = async (req, res, next) => {
  try {
    const db = getDB();

    const exists = await db.collection("accounts").findOne({
      code: req.body.code
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Account code already exists"
      });
    }

    const account = await db.collection("accounts").insertOne({
      ...req.body,
      parentId: req.body.parentId
        ? new ObjectId(req.body.parentId)
        : null,
      isSystem: false, // ❗ only seed accounts are system
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: account
    });
  } catch (err) {
    next(err);
  }
};


export const getAccountBalanceController = async (req, res) => {
  try {

    const accountId = req.params.id;
    const branchId = req.query.branchId;

    if (!accountId) {
      return res.status(400).json({
        message: "Account id is required",
      });
    }

    if (!branchId) {
      return res.status(400).json({
        message: "Branch id is required",
      });
    }

    const balance = await getAccountBalance({
      accountId,
      branchId,
    });

    res.json({
      accountId,
      branchId,
      balance,
    });

  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const db = getDB();

    /* ===============================
       1️⃣ Pagination
    =============================== */
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    /* ===============================
       2️⃣ Sorting
    =============================== */
    const sortField = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sort === "asc" ? 1 : -1;

    /* ===============================
       3️⃣ Match Filter
    =============================== */
    const match = {};

    // Branch filter
    if (req.query.branchId) {
      match.branchId = new ObjectId(req.query.branchId);
    }

    // Ref Type filter
    if (req.query.refType) {
      match.refType = req.query.refType;
    }

    // Party Type filter
    if (req.query.partyType) {
      match.partyType = req.query.partyType;
    }

    /* ===============================
       4️⃣ Search
    =============================== */
    if (req.query.search) {
      match.$or = [
        { voucherNo: { $regex: req.query.search, $options: "i" } },
        { narration: { $regex: req.query.search, $options: "i" } },
        { refType: { $regex: req.query.search, $options: "i" } },
      ];
    }

    /* ===============================
       5️⃣ Aggregation Pipeline
    =============================== */
    const pipeline = [
      { $match: match },

      /* ---- Account Join ---- */
      {
        $lookup: {
          from: "accounts",
          localField: "accountId",
          foreignField: "_id",
          as: "account",
        },
      },
      { $unwind: { path: "$account", preserveNullAndEmptyArrays: true } },

      /* ---- Branch Join ---- */
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },

      /* ---- Supplier Join ---- */
      {
        $lookup: {
          from: "suppliers",
          localField: "partyId",
          foreignField: "_id",
          as: "supplier",
        },
      },

      /* ---- Customer Join ---- */
      {
        $lookup: {
          from: "customers",
          localField: "partyId",
          foreignField: "_id",
          as: "customer",
        },
      },

      /* ---- Employee Join ---- */
      {
        $lookup: {
          from: "employees",
          localField: "partyId",
          foreignField: "_id",
          as: "employee",
        },
      },

      {
        $addFields: {
          partyName: {
            $cond: [
              { $eq: ["$partyType", "SUPPLIER"] },
              { $arrayElemAt: ["$supplier.name", 0] },
              {
                $cond: [
                  { $eq: ["$partyType", "CUSTOMER"] },
                  { $arrayElemAt: ["$customer.name", 0] },
                  { $arrayElemAt: ["$employee.name", 0] },
                ],
              },
            ],
          },
        },
      },

      {
        $project: {
          debit: 1,
          credit: 1,
          balance: 1,
          refType: 1,
          narration: 1,
          voucherNo: 1,
          date: 1,
          createdAt: 1,
          partyType: 1,
          partyName: 1,
          accountName: "$account.name",
          branchName: "$branch.name",
        },
      },

      { $sort: { [sortField]: sortOrder } },

      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "total" }],
        },
      },
    ];

    const result = await db.collection("ledgers").aggregate(pipeline).toArray();

    const data = result[0].data;
    const total = result[0].totalCount[0]?.total || 0;

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
export const getAllAccounts = async (req, res, next) => {
  try {
    const db = getDB();

    const {
      page = 1,
      limit = 20,
      search,
      type,
      subType,
      parentId,
      isSystem,
      branchId,
      code,
      level,
    } = req.query;

    const pageNo = Math.max(parseInt(page), 1);
    const limitNo = Math.min(parseInt(limit), 100);
    const skip = (pageNo - 1) * limitNo;

    const filter = {};

    /* ======================
       SEARCH (name + code)
    ====================== */
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    /* ======================
       FILTER BY TYPE
    ====================== */
    if (type) {
      filter.type = type;
    }

    /* ======================
       FILTER BY SUBTYPE
    ====================== */
    if (subType) {
      filter.subType = subType;
    }

    /* ======================
       FILTER BY CODE
    ====================== */
    if (code) {
      filter.code = code;
    }

    /* ======================
       FILTER BY PARENT
    ====================== */
    if (parentId) {
      filter.parentId = new ObjectId(parentId);
    }

    /* ======================
       FILTER BY SYSTEM
    ====================== */
    if (isSystem !== undefined) {
      filter.isSystem = isSystem === "true";
    }

    /* ======================
       FILTER BY BRANCH
    ====================== */
    if (branchId === "null") {
      filter.branchId = null;
    } else if (branchId) {
      filter.branchId = new ObjectId(branchId);
    }

    /* ======================
       LEAF LEVEL ONLY
       (No children)
    ====================== */
    if (level === "leaf") {
      const parentIds = await db.collection("accounts")
        .distinct("parentId");

      filter._id = { $nin: parentIds.filter(Boolean) };
    }

    const total = await db.collection("accounts").countDocuments(filter);

    const data = await db.collection("accounts")
      .find(filter)
      .sort({ code: 1 })
      .skip(skip)
      .limit(limitNo)
      .toArray();

    res.json({
      success: true,
      data,
      pagination: {
        page: pageNo,
        limit: limitNo,
        total,
        hasMore: skip + data.length < total,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateAccount = async (req, res, next) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const account = await db.collection("accounts").findOne({
      _id: new ObjectId(id)
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found"
      });
    }

    if (account.isSystem) {
      return res.status(403).json({
        success: false,
        message: "System account cannot be modified"
      });
    }

    await db.collection("accounts").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...req.body,
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: "Account updated"
    });
  } catch (err) {
    next(err);
  }
};
