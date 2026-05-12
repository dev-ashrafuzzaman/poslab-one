import { Router } from "express";

import {
  createOne,
  getAll,
  getOneById,
  updateOne,
  deleteOne,
  toggleStatus,
} from "../../controllers/base.controller.js";

import {
  createSupplierSchema,
  updateSupplierSchema,
} from "./supplier.validation.js";

import { beforeCreateSupplier } from "./supplier.hook.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { COLLECTIONS } from "../../database/collections.js";
import { createEmployeeController } from "./supplier.controller.js";
import { validate } from "../../validations/validate.middleware.js";

const router = Router();
const COLLECTION = COLLECTIONS.SUPPLIERS;

router.use(authenticate);

router.post(
  "/",
  validate(createSupplierSchema),
  beforeCreateSupplier,
  createEmployeeController,
);

router.get(
  "/",
  getAll({
    collection: COLLECTION,
    searchableFields: ["name", "phone", "email"],
    filterableFields: ["status"],
  }),
);

router.get(
  "/:id",
  getOneById({
    collection: COLLECTION,
  }),
);

router.put(
  "/:id",
  updateOne({
    collection: COLLECTION,
    schema: updateSupplierSchema,
  }),
);

router.post(
  "/:id/status",
  toggleStatus({
    collection: COLLECTION,
  }),
);

router.delete(
  "/:id",
  deleteOne({
    collection: COLLECTION,
  }),
);

export default router;
