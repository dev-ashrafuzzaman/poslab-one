import { getDB } from "../../config/db.js";
import * as service from "./customer.service.js";
import { ObjectId } from "mongodb";

export const create = async (req, res, next) => {
  try {
    const customer = await service.createCustomer({
      db: getDB(),
      payload: {
        ...req.body,
        code: req.generated.code,
      },
    });

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (err) {
    next(err);
  }
};

export async function getPosCustomerSummary(req, res) {
  const db = getDB();
  const customerId = new ObjectId(req.params.id);

  const customer = await db
    .collection("customers")
    .findOne({ _id: customerId });
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const membership = await db.collection("memberships").findOne({
    customerId,
  });

  const settings = await db
    .collection("loyalty_settings")
    .findOne({ status: "ACTIVE" });

  let loyalty = null;

  if (membership) {
    const cycle = await db
      .collection("loyalty_cycles")
      .findOne(
        { memberId: membership._id, status: "RUNNING" },
        { sort: { cycleNo: -1 } },
      );

    loyalty = cycle
      ? {
          current: cycle.currentCount,
          required: cycle.requiredCount,
          cycleNo: cycle.cycleNo,
        }
      : null;
  }

  const purchaseStats = await db
    .collection("sales")
    .aggregate([
      { $match: { customerId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$netAmount" },
          lastPurchaseAt: { $max: "$createdAt" },
        },
      },
    ])
    .toArray();

  res.json({
    customer,
    membership,
    loyalty,
    purchases: purchaseStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      lastPurchaseAt: null,
    },
    settings,
  });
}

export const getById = async (req, res, next) => {
  try {
    const customer = await service.getCustomerById({
      db: getDB(),
      id: req.params.id,
    });

    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    await service.updateCustomer({
      db: getDB(),
      id: req.params.id,
      payload: req.body,
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
