import * as authService from "./auth.service.js";
import { successResponse } from "../../utils/apiResponse.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/v1/auth/refresh",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } =
      await authService.login(req.body, req);

    // ✅ ONLY CONTROLLER SETS COOKIE
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    successResponse(res, {
      message: "Login successful",
      data: { accessToken, user },
    });
  } catch (err) {
    next(err);
  }
};

export const refreshTokenController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError("Refresh token missing", 401);
    }

    const { accessToken, refreshToken: newRefreshToken , user} =
      await authService.refreshToken(refreshToken);

    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

    successResponse(res, {
      message: "Token refreshed successfully",
      data: { accessToken, user },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    // 🔑 refresh token may or may not exist
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await authService.logoutByRefreshToken(refreshToken);
    }

    // 🔥 CLEAR COOKIE (IMPORTANT: path + sameSite + secure must match)
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/", // ⭐ MUST BE ROOT
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    // ❗ Logout should NEVER fail
    return res.status(200).json({
      success: true,
      message: "Logged out",
    });
  }
};


export const changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user._id, req.body, req);

    successResponse(res, {
      message: "Password changed successfully",
    });
  } catch (err) {
    next(err);
  }
};
