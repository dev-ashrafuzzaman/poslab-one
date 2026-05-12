import { getTransferDetailsService, listTransfersService } from "./stock.controller.js";

export const listStockTransfers = async (req, res, next) => {
  try {
    const result = await listTransfersService({
      user: req.user,
      query: req.query,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

/* ===============================
   SINGLE TRANSFER DETAILS
=============================== */
export const getStockTransferDetails = async (req, res, next) => {
  try {
    const result = await getTransferDetailsService({
      user: req.user,
      transferId: req.params.id,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};
