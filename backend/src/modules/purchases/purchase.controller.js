import { getDB } from "../../config/db.js";
import { createPurchase, createPurchaseReturn, createSupplierPayment } from "./purchase.service.js";
import {
  createPurchaseReturnSchema,
  createPurchaseSchema,
} from "./purchase.validation.js";

export const createPurchaseController = async (req, res, next) => {
  try {
    /* ======================
       VALIDATION
    ====================== */
    const { error, value } = createPurchaseSchema.validate(req.body, {
      abortEarly: false,  
      stripUnknown: true, 
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map(d => ({
          field: d.path.join("."),
          message: d.message,
        })),
      });
    }

    /* ======================
       SERVICE CALL
    ====================== */
    const db = getDB();

    const result = await createPurchase({
      db,
      body: value,
      req,
    });

    /* ======================
       RESPONSE
    ====================== */
    return res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const createSupplierPaymentController = async (req, res, next) => {
  try {
    const db = getDB();

    const result = await createSupplierPayment({
      db,
      body: req.body,
      req,
    });

    res.status(201).json({
      success: true,
      message: "Supplier payment successful",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const createPurchaseReturnController = async (req, res, next) => {
  try {
    const { error, value } = createPurchaseReturnSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((d) => d.message),
      });
    }

    const db = getDB();

    const result = await createPurchaseReturn({
      db,
      body: value,
      req,
    });

    res.status(201).json({
      success: true,
      message: "Purchase return created successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

