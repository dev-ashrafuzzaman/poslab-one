// membership.routes.js
import express from "express";
import {
  createMembershipCtrl,
  getMembershipsCtrl,
  membershipOverview,
} from "./membership.controller.js";
import { createMembershipSchema } from "./membership.schema.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { getAll } from "../../controllers/base.controller.js";
import { updateLoyaltySettings } from "./membership.service.js";

const router = express.Router();

router.post("/", validate(createMembershipSchema), createMembershipCtrl);

router.get(
  "/loyalty",
  getAll({
    collection: "loyalty_settings",
    searchableFields: ["name", "phone", "email", "role"],
    filterableFields: ["status", "role"],
  }),
);
router.put("/loyalty", updateLoyaltySettings);
router.get("/", getMembershipsCtrl);
router.get("/:customerId", membershipOverview);
export default router;
