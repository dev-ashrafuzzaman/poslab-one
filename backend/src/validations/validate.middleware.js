import { AppError } from "../utils/AppError.js";

/**
 * Request Validation Middleware
 * Supports Joi schemas
 *
 * Usage:
 * router.post("/", validate(schema), controller)
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return next(
        new AppError("Validation error", 422, messages)
      );
    }

    req.body = value;
    next();
  };
};
