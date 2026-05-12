import { AppError } from "../utils/AppError.js";

/**
 * Role Based Authorization Middleware
 *
 * @param  {...string} allowedRoles
 *
 * Example:
 * authorize("admin", "manager")
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      throw new AppError("Permission denied", 403);
    }

    next();
  };
};
