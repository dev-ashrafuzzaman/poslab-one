import Joi from "joi";

export const expenseSchema = Joi.object({
  expenseAccountId: Joi.string().required(),
  category: Joi.string().required(),
  paymentAccountId: Joi.string().required(),
  payment: Joi.string().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().allow("").optional(),
  referenceNo: Joi.string().allow("").optional(),
  expenseDate: Joi.date().required(),
});
