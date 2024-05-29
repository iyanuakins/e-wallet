import winston = require("winston");
import ENV from "./env";

const Logger = winston.createLogger({
  defaultMeta: { service: "e-wallet-service" },
  format: winston.format.combine(
    winston.format.printf(
      (log) =>
        `${log.level.toLocaleUpperCase()}: ${new Date().toLocaleString(
          "en-US"
        )} - ${log.message}`
    ),
    winston.format.colorize({ all: true })
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (ENV.nodeEnv === "development") {
  Logger.add(new winston.transports.Console());
}

export default Logger;
