
import { AppError } from "../utils/AppError.js";

export const csrfProtect = (req, res, next) => {
  const csrfCookie = req.cookies?.csrfToken;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    throw new AppError("Invalid CSRF token", 403);
  }

  next();
};
