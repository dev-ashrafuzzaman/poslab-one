import crypto from "crypto";

export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
