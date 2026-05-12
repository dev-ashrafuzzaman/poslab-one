import { COLLECTIONS } from "./collections.js";
// src/database/ensureCollection.js
export async function ensureCollection(db, name) {
  const exists = await db
    .listCollections({ name })
    .hasNext();

  if (!exists) {
    await db.createCollection(name);
    console.log(`🆕 Collection created: ${name}`);
  }
}

