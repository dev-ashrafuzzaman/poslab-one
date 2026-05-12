import Joi from "joi";

export const createVariantSchema = Joi.object({
  productId: Joi.string().required(),

  attributes: Joi.object({
    size: Joi.string().required(),
    color: Joi.string().required(),
  }).required(),

  status: Joi.string().valid("active", "inactive").default("active"),
});

export const updateVariantSchema = Joi.object({
  attributes: Joi.object({
    size: Joi.string().optional(),
    color: Joi.string().optional(),
  }).optional(),

  status: Joi.string().valid("active", "inactive").optional(),
}).min(1);
