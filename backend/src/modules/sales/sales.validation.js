import Joi from "joi";

export const createSaleSchema = Joi.object({
  invoiceNo: Joi.string(),
  type: Joi.string().valid("RETAIL", "WHOLESALE").required(),
  customerId: Joi.string().required(),
  salesmanId: Joi.string().required(),

  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        variantId: Joi.string().required(),
        qty: Joi.number().min(1).required(),
        sku: Joi.string().required(),
        salePrice: Joi.number().min(0).required(),
        discountId: Joi.string().optional(),
        discountType: Joi.string()
          .uppercase()
          .valid("FIXED", "PERCENT")
          .allow(null)
          .optional(),
       discountValue: Joi.number()
  .min(0)
  .when("discountType", {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional()
  })
      }),
    )
    .min(1)
    .required(),

  billDiscount: Joi.number().min(0).default(0),

  payments: Joi.array()
    .items(
      Joi.object({
        method: Joi.string().required(),
        accountId: Joi.string().required(),
        amount: Joi.number().min(0).required(),
        reference: Joi.string().optional(),
      }),
    )
    .required(),
});
