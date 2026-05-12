// deviceFingerprint.js
import crypto from "crypto";

export const getDeviceFingerprint = (req) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  const userAgent = req.headers["user-agent"] || "unknown";

  const raw = `${ip}|${userAgent}`;

  return crypto.createHash("sha256").update(raw).digest("hex");
};
