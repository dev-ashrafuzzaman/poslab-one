// auth.validation.js
import Joi from "joi";

export const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .max(16)
    .pattern(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/
    )
    .message(
      "Password must be 8-16 characters long and include at least 1 letter, 1 number, and 1 special character"
    )
    .required()
});
