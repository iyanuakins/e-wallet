import dotenv from "dotenv";

dotenv.config();
const ENV: Record<string, any> = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || "3000",
  databaseUrl: process.env.DATABASE_URL,
  rateLimitWindowsMs: process.env.RATE_LIMIT_WINDOWS_MS,
  rateLimitMaxRequest: process.env.RATE_LIMIT_MAX_REQUEST,
};

export default ENV;
