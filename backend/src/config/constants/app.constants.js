export const ENVIRONMENTS = Object.freeze({
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test"
});

export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
});

export const SORT_ORDER = Object.freeze({
  ASC: 1,
  DESC: -1
});

export const MESSAGES = Object.freeze({
  SUCCESS: "Operation successful",
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",

  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Permission denied",
  VALIDATION_ERROR: "Validation error",
  SERVER_ERROR: "Internal server error"
});
