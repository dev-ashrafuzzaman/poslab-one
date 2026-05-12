import Joi from "joi";
import { PARTY_TYPES } from "./party.constants.js";
export const createPartySchema = Joi.object({
  type: Joi.string()
    .valid(...PARTY_TYPES)
    .required(),

  name: Joi.string().required(),

  phone: Joi.string()
    .pattern(/^(01)[0-9]{9}$/)
    .required(),

  email: Joi.string().email().allow("", null),

  address: Joi.string().allow("", null),

  openingBalance: Joi.number().default(0),

  commissionPercent: Joi.number().default(0),

  creditLimit: Joi.number().default(0),

  notes: Joi.string().allow("", null),

  status: Joi.string().valid("active", "inactive").default("active"),
});

/* ================= UPDATE ================= */

export const updatePartySchema =
  Joi.object({

    name: Joi.string()
      .trim()
      .min(2)
      .max(100),

    email: Joi.string()
      .email()
      .allow("", null),

    address: Joi.string()
      .allow("", null),

    openingBalance:
      Joi.number()
        .min(0),

    commissionPercent:
      Joi.number()
        .min(0)
        .max(100),

    creditLimit:
      Joi.number()
        .min(0),

    notes:
      Joi.string()
        .allow("", null),

    status: Joi.string()
      .valid(
        "active",
        "inactive"
      ),

  }).min(1);