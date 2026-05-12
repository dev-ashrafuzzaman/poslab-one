import Joi from "joi";

export const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),

   parentId: Joi.alternatives().try(
    Joi.string(),
    Joi.object()
  ).allow(null),

  level: Joi.number().integer().valid(1, 2, 3).required(),

  status: Joi.string().valid("active", "inactive").default("active")
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  status: Joi.string().valid("active", "inactive").optional()
}).min(1);
