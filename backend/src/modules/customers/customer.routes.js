import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./customer.controller.js";
import { beforeCreateCustomer } from "./customer.hooks.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customer.schema.js";
import { deleteOne, getAll, getAllSmart, toggleStatus } from "../../controllers/base.controller.js";
import { COLLECTIONS } from "../../database/collections.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();
router.use(authenticate);

router.post(
  "/",
  validate(createCustomerSchema),
  beforeCreateCustomer,
  controller.create,
);
router.get("/:id/summary", controller.getPosCustomerSummary);
router.get(
  "/",
  getAll({
    collection: COLLECTIONS.CUSTOMERS,
    searchableFields: ["name", "phone", "email"],
    filterableFields: ["status"],
  }),
);

router.get(
  "/pos",
  getAllSmart({
    collection: COLLECTIONS.CUSTOMERS,
    searchableFields: ["name", "phone"],
    filterableFields: ["status"],
  })
);

router.get("/:id", controller.getById);
router.patch("/:id", validate(updateCustomerSchema), controller.update);

router.post(
  "/:id/status",
  toggleStatus({
    collection: COLLECTIONS.CUSTOMERS,
  })
);

router.delete(
  "/:id",
  deleteOne({ collection: COLLECTIONS.CUSTOMERS })
);

export default router;
