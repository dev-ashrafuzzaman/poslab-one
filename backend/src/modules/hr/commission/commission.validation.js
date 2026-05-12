import Joi from "joi";

export const createCommissionRuleSchema = Joi.object({
  branchId: Joi.string().required(),
  role: Joi.string().required(),
  commissionType: Joi.string()
    .valid("percentage", "fixed")
    .required(),
  commissionValue: Joi.number().min(0).required(),
  minSalesAmount: Joi.number().default(0),
});
