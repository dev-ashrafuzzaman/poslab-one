// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { AUTH } from "../config/constants/auth.constants.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith(`${AUTH.TOKEN_TYPE} `)) {
    return next(new AppError("Unauthorized", 401));
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError("Invalid token", 401));
  }
};
