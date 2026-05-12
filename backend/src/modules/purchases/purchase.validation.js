import Joi from "joi";

const variantSchema = Joi.object({
  size: Joi.string().trim().required(),
  color: Joi.string().trim().required(),

  qty: Joi.number()
    .integer()
    .min(1)
    .required(),

  costPrice: Joi.number().positive().optional(),
  salePrice: Joi.number().positive().optional(),
});
const purchaseItemSchema = Joi.object({
  productId: Joi.string().required(),

  pricingMode: Joi.string()
    .valid("GLOBAL", "VARIANT")
    .required(),

  globalPrice: Joi.when("pricingMode", {
    is: "GLOBAL",
    then: Joi.object({
      costPrice: Joi.number().positive().required(),
      salePrice: Joi.number().positive().required(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),

  variants: Joi.array()
    .items(
      Joi.when("pricingMode", {
        is: "VARIANT",
        then: variantSchema.keys({
          costPrice: Joi.number().positive().required(),
          salePrice: Joi.number().positive().required(),
        }),
        otherwise: variantSchema,
      }),
    )
    .min(1)
    .required(),
});
export const createPurchaseSchema = Joi.object({
  /* ======================
     BASIC INFO
  ====================== */
  supplierId: Joi.string().required(),

  invoiceNumber: Joi.string().trim().required(),
  invoiceDate: Joi.date().required(),

  paidAmount: Joi.number().min(0).default(0),

  /* ======================
     ITEMS
  ====================== */
  items: Joi.array()
    .items(purchaseItemSchema)
    .min(1)
    .required(),

  /* ======================
     OPTIONAL
  ====================== */
  notes: Joi.string().allow("", null).optional(),
});

export const createPurchaseReturnSchema = Joi.object({
  purchaseId: Joi.string().required(),
  returnDate: Joi.date().required(),
  reason: Joi.string().trim().min(5).required(),
  items: Joi.array()
    .items(
      Joi.object({
        variantId: Joi.string().required(),
        qty: Joi.number().integer().min(1).required(),
      }),
    )
    .min(1)
    .required(),

  returnAmount: Joi.number().positive().precision(2).required(),

  cashRefund: Joi.number().min(0).precision(2).default(0),
  dueAdjust: Joi.number().min(0).precision(2).default(0),
})
.custom((value, helpers) => {
  if (value.cashRefund + value.dueAdjust !== value.returnAmount) {
    return helpers.message(
      "cashRefund + dueAdjust must equal returnAmount",
    );
  }
  return value;
});
