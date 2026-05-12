// seed.roles.js

import { ROLE_SEEDS } from "./roles.seed.js";

export const seedRoles = async (db) => {
  for (const role of ROLE_SEEDS) {
    const exists = await db.collection("roles").findOne({ name: role.name });

    if (exists) continue;

    await db.collection("roles").insertOne({
      name: role.name,
      permissions: role.permissions,
      isSystem: role.isSystem || false,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log("✅ Roles seeded successfully");
};
