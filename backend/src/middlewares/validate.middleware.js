export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,     
    stripUnknown: true,  
    convert: true,       
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

  req.body = value;

  next();
};
