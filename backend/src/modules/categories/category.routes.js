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
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";
import { beforeCreateCategory } from "./category.hooks.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { COLLECTIONS } from "../../database/collections.js";
import { getCategories } from "./category.controller.js";

const router = Router();
const COLLECTION = COLLECTIONS.CATEGORIES;

router.use(authenticate);

router.post(
  "/",
  beforeCreateCategory,
  createOne({ collection: COLLECTION, schema: createCategorySchema }),
);

router.get("/",  getCategories());

router.get(
  "/:id",
  getOneById({ collection: COLLECTION }),
);

router.post(
  "/:id/status",
  toggleStatus({
    collection: COLLECTION,
  }),
);

router.delete(
  "/:id",
  deleteOne({ collection: COLLECTION }),
);

export default router;
