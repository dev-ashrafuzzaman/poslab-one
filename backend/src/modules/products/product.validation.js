import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().trim().min(3).max(150).required(),

  productTypeId: Joi.string().trim().required(),

  categoryId: Joi.string().trim().required(),

  subCategoryId: Joi.string().trim().required(),

  brandId: Joi.string().trim().required(),

  unitId: Joi.string().trim().required(),

  barcode: Joi.string().trim().max(100).allow(null, ""),

  model: Joi.string().trim().max(100).required(),

  rackNo: Joi.string().trim().max(50).allow(null, ""),

  description: Joi.string().trim().allow(null, ""),

  status: Joi.string().valid("active", "inactive").default("active"),

  variants: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().required(),

        values: Joi.array()
          .items(Joi.string().trim().required())
          .min(1)
          .required(),
      }),
    )
    .default([]),

  createdAt: Joi.date().default(() => new Date()),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().optional(),
  brand: Joi.string().trim().optional(),
  unit: Joi.string().valid("PCS", "METER", "PAIR").optional(),
  status: Joi.string().valid("active", "inactive").optional(),
}).min(1);
