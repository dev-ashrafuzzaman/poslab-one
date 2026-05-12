import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  createStockTransfer,
  generateStockReport,
  getAllStocks,
  getLowStock,
  getPosItems,
  getTransferItems,
  receiveStockTransfer,
} from "./stock.controller.js";
import {
  getStockTransferDetails,
  listStockTransfers,
} from "./stockTransfer.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getAllStocks);
router.post("/report", generateStockReport);
router.get("/pos-items", getPosItems);
router.get("/transfer-items", getTransferItems);
router.get("/low", getLowStock);
router.post("/transfers", createStockTransfer);
router.get("/transfers", listStockTransfers);
router.get("/transfers/:id", getStockTransferDetails);
router.post("/transfers/:id/receive", receiveStockTransfer);

export default router;
