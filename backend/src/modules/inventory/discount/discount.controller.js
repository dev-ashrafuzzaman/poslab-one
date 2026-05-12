import { createDiscount } from "./discount.service.js";

/* =========================
   CREATE DISCOUNT
========================= */
export const createDiscountController = async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const user = req.user; // from auth middleware

    const result = await createDiscount({
      db,
      user,
      payload: req.body,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
