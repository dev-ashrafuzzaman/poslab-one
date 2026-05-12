// modules/accounting/accounts/accounts.validation.js
import Joi from "joi";

export const createAccountSchema = Joi.object({
  code: Joi.string().required(),
  name: Joi.string().required(),
  type: Joi.string()
    .valid("ASSET", "LIABILITY", "INCOME", "EXPENSE", "EQUITY")
    .required(),
  subType: Joi.string().required(),
  parentId: Joi.string().allow(null),
  branchId: Joi.string().allow(null)
});

export const updateAccountSchema = Joi.object({
  name: Joi.string().optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional()
});
