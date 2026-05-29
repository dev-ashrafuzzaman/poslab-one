import Joi from "joi";

export const createUnitSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  slug: Joi.string(),
  status: Joi.string().valid("active", "inactive").default("active"),
});
export const createWarrantySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  slug: Joi.string(),
  durationDays: Joi.number().required(),
  status: Joi.string().valid("active", "inactive").default("active"),
});
