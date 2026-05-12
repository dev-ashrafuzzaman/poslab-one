import Joi from "joi";

export const generateSalarySchema = Joi.object({
  branchId: Joi.string().required(),
  month: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required(), // YYYY-MM
});

export const paySalarySchema = Joi.object({
  paidAt: Joi.date().default(Date.now),
});
 