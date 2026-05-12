import express from "express";
import {
  createCashTransferController,
  getBranchCashController,
  receiveCashTransferController
} from "./cashTransfer.controller.js";
import { getAll } from "../../../controllers/base.controller.js";

const router = express.Router();

router.get(
  "/",
  getAll({
    collection: "cash_transfers",
    searchableFields: [
      "transferCode",
      "fromBranchName",
      "toBranchName",
      "createdByName",
    ],
    filterableFields: [
      "status",
      "fromBranchId",
      "toBranchId",
    ],
    projection: {},
  })
);

router.post("/", createCashTransferController);
router.patch("/:id/receive", receiveCashTransferController);
router.get("/branch-cash", getBranchCashController);

export default router;