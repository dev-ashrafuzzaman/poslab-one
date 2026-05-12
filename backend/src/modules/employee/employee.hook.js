import { getDB } from "../../config/db.js";
import { COLLECTIONS } from "../../database/collections.js";
import { generateCode } from "../../utils/codeGenerator.js";
import { ObjectId } from "mongodb";

export const beforeCreateEmployee = async (req, res, next) => {
  try {
    const db = getDB();

    const { branchId } = req.body || {};

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "Branch is required for employee",
      });
    }

    const branch = await db.collection(COLLECTIONS.BRANCHES).findOne({
      _id: new ObjectId(branchId),
      status: "active",
    });

    if (!branch) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive branch",
      });
    }

    const exists = await db.collection(COLLECTIONS.EMPLOYEES).findOne({
      phone: req.body.phone,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Employee already exists with this phone",
      });
    }

    req.generated = {
      code: await generateCode({
        db,
        module: "EMPLOYEE",
        prefix: "EMP",
        branch: branch.code, 
      }),
    };

    next();
  } catch (err) {
    next(err);
  }
};
