// schemas/membership.schema.js
import Joi from "joi";

export const createMembershipSchema = Joi.object({
  customerId: Joi.string().required(),
});
