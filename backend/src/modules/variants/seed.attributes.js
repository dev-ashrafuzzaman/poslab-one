// modules/attributes/seed.attributes.js
import { COLLECTIONS } from "../../database/collections.js";

export const seedAttributes = async (db) => {
  /**
   * 🔒 SYSTEM LOCKED ATTRIBUTE MASTER
   * Used for Product Variants (Size, Color)
   * Idempotent & Production Safe
   */

  const attributes = [
    /* ======================
       SIZE ATTRIBUTES
    ====================== */
    { type: "size", name: "XS" },
    { type: "size", name: "S" },
    { type: "size", name: "M" },
    { type: "size", name: "L" },
    { type: "size", name: "XL" },
    { type: "size", name: "XXL" },

    /* ======================
       COLOR ATTRIBUTES
    ====================== */
    { type: "color", name: "RED" },
    { type: "color", name: "BLUE" },
    { type: "color", name: "BLACK" },
    { type: "color", name: "WHITE" },
    { type: "color", name: "GREEN" },
    { type: "color", name: "YELLOW" },
    { type: "color", name: "ORANGE" },
    { type: "color", name: "PURPLE" },
    { type: "color", name: "PINK" },
    { type: "color", name: "BROWN" },
    { type: "color", name: "GRAY" }
  ];

  const bulkOps = attributes.map((attr) => ({
    updateOne: {
      filter: {
        type: attr.type,
        name: attr.name
      },
      update: {
        $setOnInsert: {
          type: attr.type,
          name: attr.name,
          isSystem: true,        // 🔒 locked
          status: "active",
          createdAt: new Date()
        },
        $set: {
          updatedAt: new Date()
        }
      },
      upsert: true
    }
  }));

  await db
    .collection(COLLECTIONS.ATTRIBUTES)
    .bulkWrite(bulkOps, { ordered: false });

  console.log("✅ Attribute Master (Size + Color) Seeded / Synced Successfully");
};
