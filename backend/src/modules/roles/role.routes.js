import { Router } from "express";
import {
  createOne,
  getAll,
  getOneById,
  updateOne,
  deleteOne,
} from "../../controllers/base.controller.js";

import { createRoleSchema, updateRoleSchema } from "./role.validation.js";
import { authenticate } from "../../middlewares/auth.middleware.js";


const router = Router();
const COLLECTION = "roles";
router.use(authenticate);
router.post(
  "/",
  createOne({
    collection: COLLECTION,
    schema: createRoleSchema,
  }),
);

router.get(
  "/",
  getAll({
    collection: COLLECTION,
    searchableFields: ["name"],
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
    schema: updateRoleSchema,
  }),
);

router.delete(
  "/:id",
  deleteOne({
    collection: COLLECTION,
  }),
);

export default router;
