import Joi from "joi";

export const createCustomerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().trim().required(),

  email: Joi.string()
    .email()
    .allow("")
    .empty("")
    .optional(),

  address: Joi.string()
    .trim()
    .allow("")
    .empty("")
    .optional(),

  openingDue: Joi.number().min(0).default(0),
  openingAdvance: Joi.number().min(0).default(0),

  membership: Joi.object({
    type: Joi.string()
      .valid("regular", "silver", "gold", "platinum")
      .default("regular"),
    discountPercent: Joi.number().min(0).max(100).default(0),
  }).default(),

  status: Joi.string().valid("active", "inactive").default("active"),
});


export const updateCustomerSchema = Joi.object({
  name: Joi.string().trim().optional(),
  phone: Joi.string().trim().optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().trim().optional(),
  membership: Joi.object().optional(),
  status: Joi.string().valid("active", "inactive").optional()
}).min(1);
