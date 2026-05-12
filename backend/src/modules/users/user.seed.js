import bcrypt from "bcryptjs";
import { connectDB, getDB } from "../../config/db.js";
import { withCreateFields } from "../../utils/commonFields.js";
import { PERMISSIONS } from "../roles/permissions.registry.js";
import { flattenPermissions } from "../roles/permission.utils.js";

export const seedSystemUsers = async () => {
  await connectDB();
  const db = getDB();

  /* =========================
     1️⃣ SUPER ADMIN
  ========================= */
  const superAdminEmail = "superadmin@system.com";

  const superExists = await db
    .collection("users")
    .findOne({ email: superAdminEmail });

  if (!superExists) {
    const superPassword = await bcrypt.hash("Super@126Richwear", 10);

    await db.collection("users").insertOne({
      name: "Super Admin",
      email: superAdminEmail,
      password: superPassword,
      roleName: "Super Admin",
      roleId: null,
      permissions: ["*"],
      branchId: null,
      isSuperAdmin: true,
      status: "active",
      ...withCreateFields(),
    });

    console.log("🚀 Super Admin created");
  } else {
    console.log("✅ Super Admin already exists");
  }

  /* =========================
     2️⃣ DEFAULT ADMIN
  ========================= */
  const adminEmail = "admin@richwear.com";

  const adminExists = await db
    .collection("users")
    .findOne({ email: adminEmail });

  if (!adminExists) {
    const adminPassword = await bcrypt.hash("Admin@126Richwear", 10);

    const adminPermissions = flattenPermissions({
      SYSTEM: PERMISSIONS.SYSTEM,
      PRODUCT: PERMISSIONS.PRODUCT,
      PURCHASE: PERMISSIONS.PURCHASE,
      SALE: PERMISSIONS.SALE,
      CUSTOMER: PERMISSIONS.CUSTOMER,
      SUPPLIER: PERMISSIONS.SUPPLIER,
      ACCOUNT: PERMISSIONS.ACCOUNT,
      EMPLOYEE: PERMISSIONS.EMPLOYEE,
      REPORT: PERMISSIONS.REPORT,
      BRANCH: PERMISSIONS.BRANCH,
    });

    await db.collection("users").insertOne({
      name: "Admin",
      email: adminEmail,
      password: adminPassword,
      roleName: "Admin",
      roleId: null,
      permissions: adminPermissions,
      branchId: null,
      isSuperAdmin: false,
      status: "active",
      ...withCreateFields(),
    });

    console.log("🚀 Admin user created");
  } else {
    console.log("✅ Admin already exists");
  }
};
