import Joi from "joi";

/**
 * FRONTEND WILL SEND:
 * - productTypeId (required)
 * - sizeType (TEXT | NUMBER | N/A)
 * - sizeConfig ONLY IF NUMBER
 */

export const createProductSchema = Joi.object({
  name: Joi.string().trim().min(3).max(150).required(),

  categoryId: Joi.string().required(),
  level1Id: Joi.string().required(),

  productTypeId: Joi.string().required(),

  brand: Joi.string().trim().default("Richwear"),

  unit: Joi.string()
    .valid("PCS", "PAIR", "COMBO")
    .default("PCS"),

  sizeType: Joi.string()
    .valid("TEXT", "NUMBER", "N/A")
    .required(),

  // Only allowed for NUMBER
  sizeConfig: Joi.object({
    min: Joi.number().positive().required(),
    max: Joi.number().positive().greater(Joi.ref("min")).required(),
    step: Joi.number().positive().default(1),
  }).optional(),

  colors: Joi.array().items(Joi.string()).default([]),

  status: Joi.string()
    .valid("active", "inactive")
    .default("active"),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().optional(),
  brand: Joi.string().trim().optional(),
  unit: Joi.string().valid("PCS", "METER", "PAIR").optional(),
  status: Joi.string().valid("active", "inactive").optional()
}).min(1);
