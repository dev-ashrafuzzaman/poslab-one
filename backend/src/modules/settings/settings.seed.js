// modules/settings/seed.settings.js
import { COLLECTIONS } from "../../database/collections.js";

export const seedSettings = async (db) => {
  /**
   * 🔒 SYSTEM SETTINGS MASTER
   * Idempotent | Safe to re-run | ERP Standard
   */

  const settings = [
    /* ============================
       COMPANY INFORMATION
    ============================ */
    {
      key: "COMPANY_INFORMATIONS",
      value: {
        name: "Codivoo Technologies",
        phone: "01711347754",
        email: "info@codivoo.com",
        address: "Dhaka, Bangladesh",
        currency: "BDT",
        timezone: "Asia/Dhaka"
      }
    },

    /* ============================
       LOYALTY POINTS CONFIG
    ============================ */
    {
      key: "LOYALTY_POINTS",
      value: {
        enabled: true,

        earnRule: {
          spendAmount: 100,   // ৳100
          earnPoints: 1       // = 1 point
        },

        minInvoiceAmount: 500,
        round: "FLOOR",       // FLOOR | CEIL | ROUND
        applicableOn: ["SALE"]
      }
    }
  ];

  const bulkOps = settings.map((setting) => ({
    updateOne: {
      filter: { key: setting.key },
      update: {
        $setOnInsert: {
          key: setting.key,
          value: setting.value,
          isSystem: true,          // 🔒 locked system setting
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
    .collection(COLLECTIONS.SETTINGS)
    .bulkWrite(bulkOps, { ordered: false });

  console.log("✅ System Settings Seeded / Synced Successfully");
};
