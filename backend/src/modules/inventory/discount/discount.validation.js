// discounts/discount.validation.js
import { ObjectId } from "mongodb";

export const TARGET_TYPES = ["PRODUCT", "CATEGORY", "BRANCH", "BILL"];
export const DISCOUNT_TYPES = ["PERCENT", "FLAT"];

export const validateDiscountPayload = (payload) => {
  const {
    name,
    type,
    value,
    targetType,
    targetId,
  } = payload;

  if (!name?.trim()) throw new Error("Campaign name required");

  if (!DISCOUNT_TYPES.includes(type)) {
    throw new Error("Invalid discount type");
  }

  if (!TARGET_TYPES.includes(targetType)) {
    throw new Error("Invalid target type");
  }

  if (targetType !== "BILL" && !ObjectId.isValid(targetId)) {
    throw new Error("Invalid targetId");
  }

  if (type === "PERCENT" && (value <= 0 || value > 90)) {
    throw new Error("Percent must be 1–90");
  }

  if (type === "FLAT" && value <= 0) {
    throw new Error("Flat must be > 0");
  }
};
