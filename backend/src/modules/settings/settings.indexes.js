// src/modules/settings/settings.indexes.js
import { ensureIndex } from "../../database/indexManager.js";
import { COLLECTIONS } from "../../database/collections.js";

export async function settingsIndexes(db) {
  const col = db.collection(COLLECTIONS.SETTINGS);

  // Unique active setting key
  await ensureIndex(
    col,
    { key: 1 },
    {
      unique: true,
      name: "uniq_active_setting_key",
      partialFilterExpression: { status: "active" }
    }
  );

  // System settings lookup
  await ensureIndex(
    col,
    { isSystem: 1 },
    { name: "idx_system_settings" }
  );
}
