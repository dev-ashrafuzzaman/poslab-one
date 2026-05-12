import { getDB } from "../config/db.js";

export const attachSession = (req, res, next) => {
  const db = getDB();

  if (!db?.client) {
    return res.status(500).json({
      success: false,
      message: "Mongo client not available for session",
    });
  }

  req.session = db.client.startSession();
  next();
};
