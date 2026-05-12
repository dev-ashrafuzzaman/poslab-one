// src/modules/users/user.controller.js
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDB } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { createUserSchema } from "./user.validation.js";
import { resolveRole } from "./user.helper.js";

export const me = async (req, res) => {
  const db = getDB();

  const userId = new ObjectId(req.user._id);

  const user = await db
    .collection("users")
    .findOne({ _id: userId }, { projection: { password: 0, refreshToken: 0 } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({
    success: true,
    data: { user },
  });
};

export const createUser = async (req, res, next) => {
  try {
    const db = getDB();
    const payload = await createUserSchema.validateAsync(req.body);
    const employee = await db.collection("employees").findOne({
      _id: new ObjectId(payload.employeeId),
    });

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee not found",
      });
    }
    if (!employee || !employee.email) {
      return res.status(400).json({
        success: false,
        message: "Employee email not found",
      });
    }
    const exists = await db.collection("users").findOne({
      employeeId: employee._id,
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "User already exists for this employee",
      });
    }

    const roleData = await resolveRole({
      db,
      roleId: payload.roleId,
      roleName: payload.roleName,
      isSuperAdmin: payload.isSuperAdmin,
    });

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const userDoc = {
      name: employee.name,
      email: employee.email || null,
      employeeId: employee._id,
      password: hashedPassword,
      roleId: roleData.roleId,
      roleName: roleData.roleName,
      permissions: roleData.permissions,
      branchId:
        new ObjectId(payload.branchId) ||
        new ObjectId(employee.branchId) ||
        null,
      isSuperAdmin: payload.isSuperAdmin,
      status: payload.status,
      loginAttempts: 0,
      lockUntil: null,
      refreshToken: null,
      refreshTokenHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: new ObjectId(req.user?._id) || null,
      updatedBy: null,

      meta: {
        ipAddress: req.ip || null,
        device: req.headers["user-agent"] || null,
        source: "system",
      },
    };

    await db.collection("users").insertOne(userDoc);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        userId: userDoc._id,
        name: userDoc.name,
        roleName: userDoc.roleName,
        branchId: userDoc.branchId,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getUsersController = async (req, res, next) => {
  try {
    const db = getDB();

    /* ---------------- Pagination ---------------- */
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    /* ---------------- Search ---------------- */
    const search = req.query.search?.trim();
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { roleName: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    /* ---------------- Base Match ---------------- */
    const matchStage = {
      isSuperAdmin: { $ne: true }, // 🔥 hide super admin
      ...searchQuery,
    };

    /* ---------------- Aggregation ---------------- */
    const pipeline = [
      { $match: matchStage },

      /* ---- Branch Join ---- */
      {
        $lookup: {
          from: "branches",
          let: { branchId: { $toObjectId: "$branchId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$branchId"] } } },
            { $project: { name: 1, code: 1 } },
          ],
          as: "branch",
        },
      },
      { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },

      /* ---- Projection ---- */
      {
        $project: {
          password: 0,
          refreshToken: 0,
          refreshTokenHash: 0,
          loginAttempts: 0,
          lockUntil: 0,
        },
      },

      /* ---- Sort + Pagination ---- */
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const [rows, total] = await Promise.all([
      db.collection("users").aggregate(pipeline).toArray(),
      db.collection("users").countDocuments(matchStage),
    ]);

    res.status(200).json({
      success: true,
      data: rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};
