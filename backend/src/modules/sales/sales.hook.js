import { ObjectId } from "mongodb";
import { generateCode } from "../../utils/codeGenerator.js";
import { getDB } from "../../config/db.js";

export const beforeCreateSale = async (req, res, next) => {
  try {
    const db = getDB();
    const { branchId } = req.user;
    const branch = await db.collection("branches").findOne({
      _id: new ObjectId(branchId),
      status: "active",
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found or inactive",
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};
