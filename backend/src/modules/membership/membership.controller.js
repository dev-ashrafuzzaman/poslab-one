// membership.controller.js
import { createMembership, getMembershipOverview, getMemberships } from "./membership.service.js";

export async function createMembershipCtrl(req, res) {
  const id = await createMembership({
    customerId: req.body.customerId,
    branchId: req.user.branchId,
    userId: req.user._id,
  });

  res.json({ success: true, membershipId: id });
}

export async function getMembershipsCtrl(req, res) {
  const { page = 1, limit = 20, search = "" } = req.query;

  // Admin → null (all branches)
  // Branch Manager → assigned branch
  const branchId = req.user?.isAdmin ? null : req.user?.branchId;

  const result = await getMemberships({
    branchId,
    page: Number(page),
    limit: Number(limit),
    search,
  });

  res.json(result);
}


export const membershipOverview = async (req, res) => {
  const { customerId } = req.params;

  const data = await getMembershipOverview(customerId);

  if (!data) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  res.json({
    success: true,
    data,
  });
};