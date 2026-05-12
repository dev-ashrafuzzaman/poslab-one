// auth.indexes.js
export const ensureAuthIndexes = async (db) => {
  /* ================= USERS ================= */
  await db.collection("users").createIndexes([
    { key: { email: 1 }, unique: true, sparse: true },
    { key: { username: 1 }, unique: true, sparse: true },
    { key: { refreshTokenHash: 1 }, sparse: true },
    { key: { lockUntil: 1 } },
    { key: { status: 1 } },
  ]);

  /* ================= USER SESSIONS ================= */
  await db.collection("user_sessions").createIndexes([
    { key: { userId: 1 } },
    { key: { deviceId: 1 } },
    { key: { refreshTokenHash: 1 } },
    { key: { lastActiveAt: -1 } },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 }, // ⏱ auto cleanup
  ]);

  /* ================= AUDIT LOGS ================= */
  await db.collection("audit_logs").createIndexes([
    { key: { userId: 1 } },
    { key: { action: 1 } },
    { key: { createdAt: -1 } },
    { key: { refType: 1, refId: 1 } },
    { key: { branchId: 1 } },
  ]);

  console.log("✅ Auth DB indexes ensured");
};
