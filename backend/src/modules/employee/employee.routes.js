import { Router } from "express";

import {
  createOne,
  getAll,
  getOneById,
  updateOne,
  deleteOne,
  toggleStatus,
  getAllSmart,
} from "../../controllers/base.controller.js";

import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "./employee.validation.js";

import { beforeCreateEmployee } from "./employee.hook.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { COLLECTIONS } from "../../database/collections.js";
import { validate } from "../../validations/validate.middleware.js";
import { create } from "./employee.controller.js";

const router = Router();
const COLLECTION = COLLECTIONS.EMPLOYEES;

router.use(authenticate);

router.post("/", validate(createEmployeeSchema), beforeCreateEmployee, create);

router.get(
  "/",
  getAll({
    collection: COLLECTION,
    searchableFields: ["name", "phone", "email", "role"],
    filterableFields: ["status", "role","branchId"],
  }),
);

router.get(
  "/pos",
  getAllSmart({
    collection: COLLECTIONS.EMPLOYEES,
    searchableFields: ["code", "name", "phone", "role"],
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
    schema: updateEmployeeSchema,
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
