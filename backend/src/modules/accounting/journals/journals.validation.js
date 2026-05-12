// journals.validation.js
import Joi from "joi";

export const createJournalSchema = Joi.object({
  date: Joi.date().required(),
  narration: Joi.string().trim().min(3).required(),

  refType: Joi.string().required(),
  refId: Joi.string().optional(),

  branchId: Joi.string().required(),

  entries: Joi.array()
    .items(
      Joi.object({
        accountId: Joi.string().required(),

        debit: Joi.number().min(0).precision(2).default(0),
        credit: Joi.number().min(0).precision(2).default(0),

        partyType: Joi.string().optional(),
        partyId: Joi.string().optional(),
      }),
    )
    .min(2)
    .required(),
});
