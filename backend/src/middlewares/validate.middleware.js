export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,     // show all errors
    stripUnknown: true,   // remove extra fields
    convert: true,        // string → number/date
  });

  if (error) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
      })),
    });
  }

  // ✅ ALWAYS use sanitized payload
  req.body = value;

  next();
};
