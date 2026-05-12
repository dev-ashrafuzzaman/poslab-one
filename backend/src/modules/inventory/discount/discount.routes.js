import express from "express";
import { createDiscountController } from "./discount.controller.js";
import { deleteOne, getAll, toggleStatus } from "../../../controllers/base.controller.js";

const router = express.Router();

/* =========================
   DISCOUNT ROUTES
========================= */
router.post(
  "/",
  createDiscountController
);

router.get(
  "/",
  getAll({
    collection: "discounts",
    searchableFields: ["name", "type", "targetType"],
    filterableFields: ["status","type"],
  }),
);


router.post(
  "/:id/status",
  toggleStatus({
    collection: "discounts",
  }),
);

router.delete(
  "/:id",
  deleteOne({ collection: "discounts" }),
);


export default router;
