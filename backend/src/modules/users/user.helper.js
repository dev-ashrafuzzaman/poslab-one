// user.helper.js
import { ObjectId } from "mongodb";

export const resolveRole = async ({ db, roleId, roleName, isSuperAdmin }) => {
  if (isSuperAdmin) {
    return {
      roleId: null,
      roleName: "Super Admin",
      permissions: ["*"],
    };
  }

  let role = null;

  if (roleId) {
    role = await db.collection("roles").findOne({
      _id: new ObjectId(roleId),
    });
  } else if (roleName) {
    role = await db.collection("roles").findOne({ name: roleName });
  }

  if (!role) {
    throw new Error("Invalid role");
  }

  return {
    roleId: role._id,
    roleName: role.name,
    permissions: role.permissions || [],
  };
};
