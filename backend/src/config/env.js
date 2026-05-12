import dotenv from "dotenv";
dotenv.config();
export const env = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI,
  dbName: process.env.DB_NAME,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRES_IN,
  timezone: process.env.TIMEZONE
};
 