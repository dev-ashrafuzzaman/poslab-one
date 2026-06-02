import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const purchaseCreateSchema = Joi.object({
  invoiceNo: Joi.string().trim().required().messages({
    "string.empty": "Invoice Number cannot be empty.",
    "any.required": "Invoice Number is required for stock tracking."
  }),
  subject: Joi.string().trim().allow("").default(""),
  purchaseDate: Joi.string().isoDate().required().messages({
    "string.isoDate": "Purchase Date must be a valid ISO Date (YYYY-MM-DD)."
  }),
  supplierId: Joi.string().regex(objectIdPattern).required().messages({
    "string.pattern.base": "Supplier ID must be a valid 24-character hex MongoDB ObjectId."
  }),
  shippingCost: Joi.number().min(0).default(0),
  notes: Joi.string().trim().allow(null, ""),
  
  paymentInfo: Joi.object({
    subTotal: Joi.number().min(0).required(),
    grandTotal: Joi.number().min(0).required(),
    paidAmount: Joi.number().min(0).required(),
    dueAmount: Joi.number().min(0).required(),
    status: Joi.string().valid("Paid", "Partial", "Unpaid", "Due").optional(),
    
    // ফিক্সড: .className() মেথডটি রিমুভ করা হয়েছে
    splitPayments: Joi.array().items(
      Joi.object({
        accountId: Joi.string().regex(objectIdPattern).required().messages({
          "string.pattern.base": "Split Account ID must be a valid ObjectId."
        }),
        amount: Joi.number().min(0).required().messages({
          "number.min": "Split paid amount cannot be negative."
        }),
        method: Joi.string().required(),
        reference: Joi.string().trim().allow("", null),
        raw: Joi.object().optional()
      })
    ).default([]) 
  }).required(),

  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().regex(objectIdPattern).required(),
      variantId: Joi.string().regex(objectIdPattern).required(),
      sku: Joi.string().trim().required(),
      qty: Joi.number().integer().positive().required().messages({
        "number.positive": "Quantity must be at least 1 piece."
      }),
      purchasePrice: Joi.number().min(0).required(),
      salePrice: Joi.number().min(0).required(),
      productTypeName: Joi.string().trim().allow("", null).optional(), 
      serials: Joi.array().items(Joi.string().trim().uppercase()).default([])
    })
  ).min(1).required().messages({
    "array.min": "At least one variant item must be added to build a purchase voucher."
  })
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
