import { Router } from "express";

import {
  createOne,
  getAll,
  getOneById,
  updateOne,
  deleteOne,
  toggleStatus
} from "../../controllers/base.controller.js";

import {
  createVariantSchema,
  updateVariantSchema
} from "./variant.validation.js";

import { beforeCreateVariant } from "./variant.hooks.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { COLLECTIONS } from "../../database/collections.js";
import { getVariants } from "./variants.controller.js";

const router = Router();
const COLLECTION = COLLECTIONS.VARIANTS;

router.use(authenticate);

router.post(
  "/",
  beforeCreateVariant,
  createOne({
    collection: COLLECTION,
    schema: createVariantSchema
  })
);

router.get(
  "/attributes",
  getAll({
    collection: COLLECTIONS.ATTRIBUTES,
    searchableFields: ["name", "type"],
    filterableFields: ["status", "type"]
  })
);


router.get(
  "/",
  getVariants
);


router.get(
  "/:id",
  getOneById({ collection: COLLECTION })
);


router.put(
  "/:id",
  updateOne({
    collection: COLLECTION,
    schema: updateVariantSchema
  })
);


router.post(
  "/:id/status",
  toggleStatus({
    collection: COLLECTION,
  })
);

router.delete(
  "/:id",
  deleteOne({ collection: COLLECTION })
);

export default router;
