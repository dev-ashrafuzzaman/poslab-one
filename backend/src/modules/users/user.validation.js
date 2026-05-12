import Joi from "joi";

const passwordRule = Joi.string()
  .min(8)
  .max(16)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/)
  .message(
    "Password must be 8-16 characters long and include at least 1 letter, 1 number, and 1 special character",
  );

export const createUserSchema = Joi.object({
  employeeId: Joi.string().required(),
  password: passwordRule.required(),
  roleId: Joi.string().optional(),
  roleName: Joi.string().optional(),
  branchId: Joi.string().allow(null),
  status: Joi.string().valid("active", "inactive").default("active"),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(3).optional(),
  password: passwordRule.optional(),
  branchId: Joi.string().optional(),
  status: Joi.string().valid("active", "inactive").optional(),
});
