import Joi from "joi";

export const createBranchSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  code: Joi.string().trim().uppercase().required(),
  address: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  altPhone: Joi.string().trim().required(),
  isMain: Joi.boolean().default(false),
  status: Joi.string().valid("active", "inactive").default("active")
});

export const updateBranchSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  address: Joi.string().trim().optional(),
  phone: Joi.string().trim().optional(),
  isMain: Joi.boolean().optional(),
  status: Joi.string().valid("active", "inactive").optional()
}).min(1);
