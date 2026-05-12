import Joi from "joi";

export const createSupplierSchema = Joi.object({
  name: Joi.string().required(),

  contact: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string()
      .pattern(/^(01)[0-9]{9}$/)
      .required(),
    email: Joi.string().email().optional(),
  }).required(),

  address: Joi.string().optional(),
  status: Joi.string()
    .valid("active", "inactive", "terminated")
    .default("active"),
  account: Joi.object({
    openingBalance: Joi.number().min(0).default(0),
    balanceType: Joi.string().valid("payable", "receivable").default("payable"),
  }).default(),
});

export const updateSupplierSchema = Joi.object({
  name: Joi.string().trim().optional(),
  phone: Joi.string().trim().optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().trim().optional(),
  status: Joi.string().valid("active", "inactive").optional(),
}).min(1);
