import Joi from "joi";

export const createSalesReturnSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        saleItemId: Joi.string().required(),
        qty: Joi.number().min(1).required(),
        reason: Joi.string().required(),
      })
    )
    .min(1)
    .required(),

  // 🔒 fixed for POS
  refundMethod: Joi.string()
    .valid("CASH")
    .optional(),
});
