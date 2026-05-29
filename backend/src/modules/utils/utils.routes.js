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
import {
  beforeCreateBrand,
  beforeCreateUnit,
  beforeCreateWarranty,
} from "./utils.hooks.js";

const router = Router();
const COLLECTION = COLLECTIONS.UNITS;

router.use(authenticate);

router.post(
  "/unit",
  beforeCreateUnit,
  createOne({ collection: COLLECTION, schema: createUnitSchema }),
);

router.get(
  "/unit",
  getAll({
    collection: COLLECTION,
    searchableFields: ["name"],
    filterableFields: ["status"],
  }),
);

router.post(
  "/warranty",
  beforeCreateWarranty,
  createOne({
    collection: COLLECTIONS.WARRANTIES,
    schema: createWarrantySchema,
  }),
);

router.get(
  "/warranty",
  getAll({
    collection: COLLECTIONS.WARRANTIES,
    searchableFields: ["name"],
    filterableFields: ["status"],
  }),
);
router.post(
  "/brand",
  beforeCreateBrand,
  createOne({
    collection: COLLECTIONS.BRANDS,
    schema: createUnitSchema,
  }),
);

router.get(
  "/brand",
  getAll({
    collection: COLLECTIONS.BRANDS,
    searchableFields: ["name"],
    filterableFields: ["status"],
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
