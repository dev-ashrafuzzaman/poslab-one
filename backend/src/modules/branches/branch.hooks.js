import { ObjectId } from "mongodb";
import { getDB } from "../../config/db.js";

export const beforeCreateBranch = async (req, res, next) => {
  try {
    const db = getDB();

    if (req.body.isMain) {
      const exists = await db.collection("branches").findOne({
        isMain: true,
        status: "active",
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Main branch already exists",
        });
      }
    }

    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase().trim();
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const beforeUpdateBranch = async (req, res, next) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID",
      });
    }

    if (req.body.isMain) {
      const exists = await db.collection("branches").findOne({
        isMain: true,
        _id: { $ne: new ObjectId(id) },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Another main branch already exists",
        });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};
