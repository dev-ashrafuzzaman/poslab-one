import { ensureCollection } from "./ensureCollection.js";

export async function ensureIndex(collection, keys, options = {}) {
  // ✅ ensure collection exists FIRST
  await ensureCollection(
    collection.db,
    collection.collectionName
  );

  const indexes = await collection.indexes();
  const keyStr = JSON.stringify(keys);

  const existing = indexes.find(
    (idx) => JSON.stringify(idx.key) === keyStr
  );

  if (existing) {
    if (options.name && existing.name !== options.name) {
      console.warn(
        `⚠️ Index key ${keyStr} exists as "${existing.name}", expected "${options.name}"`
      );
    }
    return;
  }

  await collection.createIndex(keys, options);

  console.log(
    `➕ Index created on ${collection.collectionName}:`,
    keys,
    options.name ? `(${options.name})` : ""
  );
}
