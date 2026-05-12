import express from "express";
import { approveAccountTransferController, createAccountTransferController } from "./accountTransfer.controller.js"
import { getAll } from "../../../controllers/base.controller.js";

const router = express.Router();

router.get(
  "/",
  getAll({
    collection:"account_transfers",
    searchableFields:["transferCode"],
    filterableFields:["status","branchId"]
  })
)

router.post("/",createAccountTransferController)

router.patch("/:id/approve",approveAccountTransferController)


export default router;