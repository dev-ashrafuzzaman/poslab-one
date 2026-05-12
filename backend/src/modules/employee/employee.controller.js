import { getDB } from "../../config/db.js";
import { createEmployee } from "./employee.service.js";
export const create = async (req, res, next) => {
  try {
    const customer = await createEmployee({
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
