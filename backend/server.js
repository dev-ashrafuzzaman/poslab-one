import http from "http";
import "./src/config/env.js";
import app from "./src/app.js";
import { closeDB ,connectDB} from "./src/config/db.js";
import { runIndexes } from "./src/database/runIndexes.js";
import { startSchedulers } from "./src/jobs/scheduler.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const db = await connectDB();

    // attach once (optional – legacy support)
    app.locals.db = db;
    // TODO: remove app.locals.db after full refactor

    await runIndexes(db);
  startSchedulers(app);
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT} (${process.env.NODE_ENV})`,
      );
    });

    /* ===============================
       GRACEFUL SHUTDOWN
    =============================== */
    const shutdown = async () => {
      console.log("🛑 Shutting down server...");
      await closeDB();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("❌ Server start failed:", error);
    process.exit(1);
  }
};

startServer();
