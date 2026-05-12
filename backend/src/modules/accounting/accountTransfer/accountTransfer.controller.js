import {
  approveAccountTransferService,
  createAccountTransferService,
} from "./accountTransfer.service.js";

export const createAccountTransferController = async (req, res) => {
  try {
    const id = await createAccountTransferService({
      user: req.user,
      branchId: req.body.branchId,
      toBranchId: req.body.toBranchId,
      fromAccountId: req.body.fromAccountId,
      toAccountId: req.body.toAccountId,
      amount: req.body.amount,
      charge: req.body.charge,
      narration: req.body.narration,
    });

    res.json({ success: true, id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const approveAccountTransferController = async (req, res) => {
  try {
    const transferId = req.params.id;

    if (!transferId) {
      return res.status(400).json({
        message: "Transfer id is required",
      });
    }

    await approveAccountTransferService({
      transferId,
      user: req.user,
    });

    res.json({
      success: true,
      message: "Account transfer approved successfully",
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};
