import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../validations/validate.middleware.js";
import { createPartySchema, updatePartySchema } from "./party.validation.js";
import { createPartyController, updatePartyController } from "./party.controller.js";

import {
  getAll,
  getOneById,
  updateOne,
  deleteOne,
  toggleStatus,
} from "../../controllers/base.controller.js";

import { COLLECTIONS } from "../../database/collections.js";

const router = Router();
const COLLECTION = COLLECTIONS.PARTIES;

router.use(authenticate);

/* ================= CREATE ================= */

router.post("/", validate(createPartySchema), createPartyController);

/* ================= GET ALL ================= */

router.get(
  "/",
  getAll({
    collection: COLLECTION,
    searchableFields: ["name", "phone", "email", "code"],
    filterableFields: ["status", "type"],
  }),
);

/* ================= GET ONE ================= */

router.get(
  "/:id",

  getOneById({
    collection: COLLECTION,
  }),
);

/* ================= UPDATE ================= */

router.put(
  "/info/:id",
  validate(updatePartySchema),
  updatePartyController
);
/* ================= STATUS ================= */

router.post(
  "/:id/status",
  toggleStatus({
    collection: COLLECTION,
  }),
);

/* ================= DELETE ================= */

router.delete(
  "/:id",
  deleteOne({
    collection: COLLECTION,
  }),
);

export default router;
