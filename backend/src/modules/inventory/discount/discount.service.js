// discounts/discount.service.js
import { ObjectId } from "mongodb";
import {
  getBDMidnight,
} from "./discount.utils.js";
import {
  validateDiscountPayload,
} from "./discount.validation.js";

/* ================================
   CREATE DISCOUNT
================================ */
export const createDiscount = async ({
  db,
  user,
  payload,
}) => {
  validateDiscountPayload(payload);

  const {
    name,
    type,
    value,
    targetType,
    targetId,
    startDate,
    endDate,
    isLifetime = false,
    priority = 1,
  } = payload;

  const today = getBDMidnight();

  const start = getBDMidnight(startDate);
  const end = isLifetime ? null : getBDMidnight(endDate);

  if (!isLifetime && start > end) {
    throw new Error("Start date > end date");
  }

  /* ================================
     ACTIVE CONFLICT CHECK
     (ONLY CURRENTLY ACTIVE)
  ================================ */
  const conflict = await db.collection("discounts").findOne({
    targetType,
    targetId: targetType === "BILL" ? null : new ObjectId(targetId),
    status: "active",
    startDate: { $lte: today },
    $or: [
      { isLifetime: true },
      { endDate: { $gte: today } },
    ],
  });

  if (conflict) {
    throw new Error("Active discount already exists");
  }

  /* ================================
     INSERT
  ================================ */
  await db.collection("discounts").insertOne({
    name: name.trim(),
    type,
    value,
    targetType,
    targetId: targetType === "BILL" ? null : new ObjectId(targetId),

    startDate: start,
    endDate: end,
    isLifetime,
    priority,

    status: "active",
    createdBy: new ObjectId(user._id),
    createdAt: new Date(),
  });

  return { message: "Discount created" };
};

/* ================================
   FETCH ACTIVE PRODUCT DISCOUNTS
================================ */
export const getActiveProductDiscounts = async ({
  db,
  productIds,
}) => {
  const today = getBDMidnight();

  return db.collection("discounts").find({
    status: "active",
    targetType: "PRODUCT",
    targetId: { $in: productIds },

    startDate: { $lte: today },
    $or: [
      { isLifetime: true },
      { endDate: { $gte: today } },
    ],
  }).toArray();
};


export const getActiveDiscountsForPOS = async ({
  db,
  branchId,
  productIds,
  categoryIds,
}) => {
  const today = getBDMidnight();

return db.collection("discounts").find({
  status: "active",
  startDate: { $lte: today },
  $and: [
    {
      $or: [
        { isLifetime: true },
        { endDate: { $gte: today } },
      ],
    },
    {
      $or: [
        { targetType: "PRODUCT", targetId: { $in: productIds } },
        { targetType: "CATEGORY", targetId: { $in: categoryIds } },
        { targetType: "BRANCH", targetId: new ObjectId(branchId) },
      ],
    },
  ],
}).toArray();
};


/* ======================================================
   AUTO EXPIRE DISCOUNTS
====================================================== */
export const expireDiscounts = async ({ db }) => {
  const now = new Date();

  const result = await db.collection("discounts").updateMany(
    {
      status: "active",
      isLifetime: false,
      endDate: { $lt: now },
    },
    {
      $set: {
        status: "inactive",
        expiredAt: now,
        updatedAt: now,
      },
    }
  );

  return {
    expiredCount: result.modifiedCount,
  };
};
