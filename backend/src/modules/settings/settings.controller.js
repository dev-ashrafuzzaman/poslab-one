import { ObjectId } from "mongodb";
import { getDB } from "../../config/db.js";
import { COLLECTIONS } from "../../database/collections.js";

/* =========================
   GET COMPANY INFO
========================= */
export const getCompanyInfo = async (req, res) => {
  try {
    const db = getDB();
    const data = await db.collection(COLLECTIONS.SETTINGS).findOne({
      key: "COMPANY_INFORMATIONS",
    });

    return res.json({
      success: true,

      /* 🔥 TABLE FORMAT */
      rows: data ? [data] : [],

      pagination: {
        page: 1,
        limit: 10,
        total: data ? 1 : 0,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch company info" });
  }
};

/* =========================
   UPDATE COMPANY INFO
========================= */
export const updateCompanyInfo = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const payload = req.body;

    const result = await db.collection(COLLECTIONS.SETTINGS).findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          value: payload,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    res.json({
      success: true,
      message: "Company info updated successfully",
      data: result.value,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
};
