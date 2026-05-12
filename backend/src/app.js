import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import routes from "../routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

/* =====================================================
   CORS CONFIG (MULTI ORIGIN | COOKIE SAFE | PROD READY)
===================================================== */

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://richwearbd.com,https://richwearbd.com"
)
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* =====================================================
   GLOBAL MIDDLEWARES
===================================================== */

app.use(cookieParser()); // 🍪 must be before routes

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =====================================================
   LOGGING
===================================================== */

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy 🚀",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/* =====================================================
   API ROUTES
===================================================== */

app.use("/api/v1", routes);

/* =====================================================
   404 HANDLER
===================================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =====================================================
   CENTRAL ERROR HANDLER
===================================================== */

app.use(errorHandler);

export default app;
