export const seedCommissionsRules = async (db) => {
  await db.collection("commission_rules").insertOne({
    code: "WH-MAIN",
    name: "Central Warehouse",
    address: "Jhikargachha, Jashore, Bangladesh",
    status: "active",   
    isMain: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✅ Commission Rules Seeded Successfully");
};
