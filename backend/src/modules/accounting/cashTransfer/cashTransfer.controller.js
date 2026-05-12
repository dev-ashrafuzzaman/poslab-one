
import {
  createCashTransferService,
  receiveCashTransferService
} from "./cashTransfer.service.js";
import { getBranchCashBalance } from "./cashBalance.service.js";

export const getBranchCashController = async (req, res) => {
  try {

    const branchId = req.user.branchId;

    const balance = await getBranchCashBalance({
      branchId
    });

    res.json({
      branchId,
      availableCash: balance
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const createCashTransferController = async (req, res) => {
  try {
    const id = await createCashTransferService({
      user: req.user,
      amount: req.body.amount,
      narration: req.body.narration,
      toBranchId: req.body.toBranchId || null
    });

    res.json({ success: true, id });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const receiveCashTransferController = async (req, res) => {
  try {

    await receiveCashTransferService({
      transferId: req.params.id,
      user: req.user
    });

    res.json({ success: true });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};