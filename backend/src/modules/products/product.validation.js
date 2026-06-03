import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  productTypeId: Joi.string().regex(objectIdPattern).required(),
  categoryId: Joi.string().regex(objectIdPattern).required(),
  subCategoryId: Joi.string().regex(objectIdPattern).allow(null, ""),
  brandId: Joi.string().regex(objectIdPattern).required(),
  unitId: Joi.string().regex(objectIdPattern).required(),

  barcode: Joi.string().trim().max(100).allow(null, ""),
  model: Joi.string().trim().max(100).allow(null, ""),
  rackNo: Joi.string().trim().max(100).allow(null, ""),
  description: Joi.string().trim().allow(null, ""),
  warrantyId: Joi.string().regex(objectIdPattern).allow(null, ""),
  status: Joi.string().valid("active", "inactive").default("active"),

  variants: Joi.array()
    .items(
      Joi.object({
        attributeName: Joi.string().trim().required(),
        attributeValue: Joi.string().trim().required(),
        model: Joi.string().trim().max(100).allow(null, ""),
        barcode: Joi.string().trim().max(100).allow(null, ""),
        warrantyId: Joi.string().regex(objectIdPattern).allow(null, ""),
      }),
    )
    .default([]),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().optional(),
  brand: Joi.string().trim().optional(),
  unit: Joi.string().valid("PCS", "METER", "PAIR").optional(),
  status: Joi.string().valid("active", "inactive").optional(),
}).min(1);
