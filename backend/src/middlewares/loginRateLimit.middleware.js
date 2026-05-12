// src/middlewares/loginRateLimit.middleware.js
import rateLimit from "express-rate-limit";
import { ipKeyGenerator } from "express-rate-limit";
import { LOGIN_SECURITY } from "../config/constants/index.js";

export const loginRateLimit = rateLimit({
  windowMs: LOGIN_SECURITY.RATE_LIMIT_WINDOW_SEC * 1000,
  max: LOGIN_SECURITY.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many login attempts. Please try again later."
  },

  keyGenerator: (req) => {
    const ipKey = ipKeyGenerator(req); // ✅ REQUIRED
    const email = req.body?.email || "unknown";
    return `${ipKey}:${email}`;
  }
});
