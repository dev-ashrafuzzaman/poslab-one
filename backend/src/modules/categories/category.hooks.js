import { ObjectId } from "mongodb";
import { toObjectId } from "../../utils/safeObjectId.js";
import { getDB } from "../../config/db.js";

export const beforeCreateCategory = async (req, res, next) => {
  try {
    const db = getDB();

    const { name } = req.body;
    const level = Number(req.body.level);
    const parentId = toObjectId(req.body.parentId, "parentId");

    /* ---------- Basic checks ---------- */
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    if (!Number.isInteger(level) || level < 1 || level > 3) {
      return res.status(400).json({
        success: false,
        message: "Invalid category level"
      });
    }

    if (level === 1 && parentId) {
      return res.status(400).json({
        success: false,
        message: "Level 1 category cannot have parent"
      });
    }

    if (level > 1 && !parentId) {
      return res.status(400).json({
        success: false,
        message: "Sub category must have parent"
      });
    }

    /* ---------- Parent validation ---------- */
    if (parentId) {
      const parent = await db.collection("categories").findOne({
        _id: parentId
      });

      if (!parent) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent category"
        });
      }

      if (parent.level !== level - 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid category level hierarchy"
        });
      }
    }

    /* ---------- Duplicate check (DB only) ---------- */
    const duplicateQuery = {
      name,
      level,
      parentId: parentId ?? null
    };

    const exists = await db.collection("categories").findOne(
      duplicateQuery,
      { projection: { _id: 1 } }
    );

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Category already exists under this parent"
      });
    }

    /* ---------- Final assign ---------- */
    req.body.level = level;
    req.body.parentId = parentId;
    req.body.status = req.body.status ?? "active";

    next();
  } catch (err) {
    if (err.message?.startsWith("Invalid")) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
};
