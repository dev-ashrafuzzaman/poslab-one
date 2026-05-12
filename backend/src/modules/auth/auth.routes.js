// auth.routes.js
import { Router } from "express";
import * as controller from "./auth.controller.js";
import { validate } from "../../validations/validate.middleware.js";
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from "./auth.validation.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { loginRateLimit } from "../../middlewares/loginRateLimit.middleware.js";

const router = Router();

router.post("/login", loginRateLimit, validate(loginSchema), controller.login);

router.post("/refresh", controller.refreshTokenController);

router.post("/logout", controller.logout);

router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  controller.changePassword,
);

export default router;
