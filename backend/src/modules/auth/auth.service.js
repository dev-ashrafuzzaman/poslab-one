import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDB } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { writeAuditLog } from "../../utils/logger.js";
import { AUDIT_ACTIONS, LOGIN_SECURITY } from "../../config/constants/index.js";

/* ================= TOKEN CONFIG ================= */
const ACCESS_EXPIRES = "15h";
const REFRESH_EXPIRES = "7d";

/* ================= HELPERS ================= */
const generateAccessToken = (user,branchName) =>
  jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      roleName: user.roleName,
      branchId: user.branchId,
      branchName,
      permissions: user.permissions,
      isSuperAdmin: user.isSuperAdmin || false,
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );

const generateRefreshToken = (userId) =>
  jwt.sign({ _id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });

/* ================= LOGIN ================= */
export const login = async ({ identifier, password }, req) => {
  const db = getDB();

  const user = await db.collection("users").findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!user) throw new AppError("Invalid credentials", 401);
  if (user.status !== "active") throw new AppError("Account inactive", 403);

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new AppError("Account locked. Try later.", 423);
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    const attempts = (user.loginAttempts || 0) + 1;

    const update = { loginAttempts: attempts };
    if (attempts >= LOGIN_SECURITY.MAX_ATTEMPTS) {
      update.lockUntil = new Date(
        Date.now() + LOGIN_SECURITY.LOCK_MINUTES * 60 * 1000
      );
    }

    await db.collection("users").updateOne({ _id: user._id }, { $set: update });

    await writeAuditLog({
      db,
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      collection: "users",
      payload: { identifier },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      status: "FAILED",
    });

    throw new AppError("Invalid credentials", 401);
  }

  const branch = await db.collection("branches").findOne(
    { _id: user.branchId },
    { projection: { name: 1 } }
  ); 

  const accessToken = generateAccessToken(user, branch?.name);
  const refreshToken = generateRefreshToken(user._id);

  await db.collection("users").updateOne(
    { _id: user._id },
    {
      $set: {
        loginAttempts: 0,
        lockUntil: null,
        refreshTokenHash: await bcrypt.hash(refreshToken, 10),
        updatedAt: new Date(),
      },
    }
  );

  await writeAuditLog({
    db,
    userId: user._id,
    action: AUDIT_ACTIONS.LOGIN,
    collection: "users",
    documentId: user._id,
    status: "SUCCESS",
  });

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      roleName: user.roleName,
      branchId: user.branchId,
      branchName: branch?.name || null,
      permissions: user.permissions,
      isSuperAdmin: user.isSuperAdmin || false,
    },
  };
};

/* ================= REFRESH ================= */
// auth.service.js
export const refreshToken = async (token) => {
  if (!token) throw new AppError("Unauthorized", 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const db = getDB();

  const user = await db.collection("users").findOne({
    _id: new ObjectId(decoded._id),
    status: "active",
  });

  if (!user?.refreshTokenHash) {
    throw new AppError("Refresh session not found", 401);
  }

  const isValid = await bcrypt.compare(token, user.refreshTokenHash);
  if (!isValid) {
    throw new AppError("Refresh token reuse detected. Login again.", 401);
  }

    const branch = await db.collection("branches").findOne(
    { _id: user.branchId },
    { projection: { name: 1 } }
  );

  
  // 🔁 Rotate tokens
  const newAccessToken = generateAccessToken(user, branch?.name);
  const newRefreshToken = generateRefreshToken(user._id);
 
  const newHash = await bcrypt.hash(newRefreshToken, 10);

  await db.collection("users").updateOne(
    { _id: user._id },
    { $set: { refreshTokenHash: newHash } }
  );

 return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      roleName: user.roleName,
      branchId: user.branchId,
      branchName: branch?.name,
      permissions: user.permissions,
      isSuperAdmin: user.isSuperAdmin || false,
    },
  };
};

/* ================= LOGOUT ================= */
export const logout = async (userId, req) => {
  const db = getDB();

  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $unset: { refreshTokenHash: "" } }
  );

  await writeAuditLog({
    db,
    userId,
    action: AUDIT_ACTIONS.LOGOUT,
    collection: "users",
    documentId: userId,
    status: "SUCCESS",
  });

  return true;
};

export const logoutByRefreshToken = async (refreshToken) => {
  const db = getDB();

  const hash = hashToken(refreshToken);

  await db.collection("users").updateOne(
    { refreshTokenHash: hash },
    { $unset: { refreshTokenHash: "" } }
  );

  // optional audit
};
