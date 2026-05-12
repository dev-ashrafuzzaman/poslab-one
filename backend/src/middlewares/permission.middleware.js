export const permit = (...requiredPermissions) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    if (user.isSuperAdmin || user.permissions?.includes("*")) {
      return next();
    }

    if (!Array.isArray(user.permissions)) {
      throw new AppError("Permission denied", 403);
    }

    const allowed = requiredPermissions.every((p) =>
      user.permissions.includes(p)
    );

    if (!allowed) {
      throw new AppError("Permission denied", 403);
    }

    next();
  };
};
