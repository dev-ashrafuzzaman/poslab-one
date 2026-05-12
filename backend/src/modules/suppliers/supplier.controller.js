import { getDB } from "../../config/db.js";
import { createSupplier } from "./supplier.service.js";
export const createEmployeeController = async (req, res, next) => {
  try {
    const customer = await createSupplier({
      db: getDB(),
      payload: {
        ...req.body,
        code: req.generated.code
      }
    });

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (err) {
    next(err);
  }
};
