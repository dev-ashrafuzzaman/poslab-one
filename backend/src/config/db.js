import "./env.js";
import { MongoClient } from "mongodb";

let db;
let client;

export const connectDB = async () => {
  if (db) return db; // ✅ prevent multiple connections

  client = new MongoClient(process.env.MONGO_URI, {
    maxPoolSize: 20,          // production safe
    minPoolSize: 5,
  });

  await client.connect();

  db = client.db(process.env.DB_NAME);

  // 🔑 attach client for transactions
  db.client = client;

  console.log(`✅ MongoDB connected → ${process.env.DB_NAME}`);

  return db;
}; 

export const getDB = () => {
  if (!db) {
    throw new Error("❌ DB not initialized. Call connectDB() first.");
  }
  return db;
};

export const closeDB = async () => {
  if (client) {
    await client.close();
    console.log("🛑 MongoDB connection closed");
  }
};
