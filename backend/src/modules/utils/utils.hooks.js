import { getDB } from "../../config/db.js";
import { COLLECTIONS } from "../../database/collections.js";

export const beforeCreateUnit = async (req, res, next) => {
  try {
    const db = getDB();

    let { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Unit name is required",
      });
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/\s+/g, "-");

    const exists = await db.collection(COLLECTIONS.UNITS).findOne({
      slug,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: `${cleanName} already exists`,
      });
    }

    req.body.name = cleanName;
    req.body.slug = slug;

    next();
  } catch (err) {
    next(err);
  }
};

export const beforeCreateBrand = async (req, res, next) => {
  try {
    const db = getDB();

    let { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Brand name is required",
      });
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/\s+/g, "-");

    const exists = await db.collection(COLLECTIONS.BRANDS).findOne({
      slug,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: `${cleanName} already exists`,
      });
    }

    req.body.name = cleanName;
    req.body.slug = slug;

    next();
  } catch (err) {
    next(err);
  }
};

export const beforeCreateWarranty = async (req, res, next) => {
  try {
    const db = getDB();

    let { name, durationDays } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Warranty name is required",
      });
    }


    const cleanName = name.trim();

    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");

    const exists = await db.collection(COLLECTIONS.WARRANTIES).findOne({
      slug,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: `${cleanName} already exists`,
      });
    }

    req.body.name = cleanName;
    req.body.slug = slug;

    next();
  } catch (err) {
    next(err);
  }
};
