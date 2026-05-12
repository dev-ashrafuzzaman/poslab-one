import { COLLECTIONS } from "../../database/collections.js";

export const seedBranches = async (db) => {
  await db.collection(COLLECTIONS.BRANCHES).insertOne({
    code: "WH-MAIN",
    name: "Central Warehouse",
    address: "Jhikargachha, Jashore, Bangladesh",
    status: "active",   
    isMain: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✅ Branches Seeded Successfully");
};
