import { Router } from "express";
import {
  createOne,
  getAll,
  getOneById,
  updateOne,
  deleteOne,
  toggleStatus,
} from "../../controllers/base.controller.js";
import { COLLECTIONS } from "../../database/collections.js";
import { createUser, getUsersController, me } from "./users.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();
const COLLECTION = COLLECTIONS.USERS;
router.use(authenticate);

router.get("/me", me);

router.post("/", createUser);

router.get("/", getUsersController);

router.get(
  "/:id",
  getOneById({
    collection: COLLECTION,
    projection: { password: 0 },
  }),
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
    collection: COLLECTION,
  }),
);

export default router;
