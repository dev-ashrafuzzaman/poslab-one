import { connectDB } from "../src/config/db.js";
import { seedChartOfAccounts } from "../src/modules/accounting/seed.accounts.js";
import { seedBranches } from "../src/modules/branches/seed.branch.js";
import { seedLoyaltySettings } from "../src/modules/membership/loyaltySettings.seeder.js";
import { seedProductTypes } from "../src/modules/products/productType.seed.js";
import { seedRoles } from "../src/modules/roles/seed.roles.js";
import { seedcommissionRules } from "../src/modules/sales/commission.seed.js";
import { seedSettings } from "../src/modules/settings/settings.seed.js";
import { seedSystemUsers } from "../src/modules/users/user.seed.js";
import { seedAttributes } from "../src/modules/variants/seed.attributes.js";

(async () => {
//   if (process.env.NODE_ENV === "production") {
//     console.error("❌ Seeder blocked in production");
//     process.exit(1);
//   }

  const db = await connectDB();

  await seedChartOfAccounts(db);
  await seedSystemUsers(db);
  await seedBranches(db);
  await seedAttributes(db);
  await seedcommissionRules(db);
  await seedProductTypes(db);
  await seedRoles(db);
  await seedSettings(db);
  await seedLoyaltySettings(db);

  console.log("✅ Seeding completed");
  process.exit(0);
})();
