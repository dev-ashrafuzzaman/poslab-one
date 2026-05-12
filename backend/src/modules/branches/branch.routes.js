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
  createBranchSchema,
  updateBranchSchema
} from "./branch.validation.js";

import {
  beforeCreateBranch,
  beforeUpdateBranch
} from "./branch.hooks.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { COLLECTIONS } from "../../database/collections.js";

const router = Router();
const COLLECTION = COLLECTIONS.BRANCHES;

router.use(authenticate);

router.post(
  "/",
  beforeCreateBranch,
  createOne({
    collection: COLLECTION,
    schema: createBranchSchema
  })
);

router.get(
  "/",
  getAll({
    collection: COLLECTION,
    searchableFields: ["name", "code", "address"],
    filterableFields: ["status", "isMain", "_id"]
  })
);

router.get(
  "/:id",
  getOneById({
    collection: COLLECTION
  })
);

router.put(
  "/:id",
  beforeUpdateBranch,
  updateOne({
    collection: COLLECTION,
    schema: updateBranchSchema
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
  deleteOne({
    collection: COLLECTION
  })
);

export default router;
