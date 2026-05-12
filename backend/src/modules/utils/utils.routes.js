import { Router } from "express";
import {
  createOne,
  getAll,
  getOneById,
  updateOne,
  deleteOne,
  toggleStatus,
} from "../../controllers/base.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { COLLECTIONS } from "../../database/collections.js";
import { createUnitSchema, createWarrantySchema } from "./utils.validations.js";

const router = Router();
const COLLECTION = COLLECTIONS.UTILS;

router.use(authenticate);

router.post(
  "/",
  createOne({ collection: COLLECTION, schema: createUnitSchema }),
);
router.post(
  "/warranty",
  createOne({ collection: COLLECTION, schema: createWarrantySchema }),
);

router.get(
  "/",
  getAll({
    collection: COLLECTIONS.UTILS,
    searchableFields: ["name"],
    filterableFields: ["status", "type"],
  }),
);

router.get("/:id", getOneById({ collection: COLLECTION }));

router.post(
  "/:id/status",
  toggleStatus({
    collection: COLLECTION,
  }),
);

router.delete("/:id", deleteOne({ collection: COLLECTION }));

export default router;
