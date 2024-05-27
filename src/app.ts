import express, { Express } from "express";
import Logger from "./common/config/logger";
import errorHandler from "./common/middleware/errorHandler";
import rateLimiter from "./common/middleware/rateLimiter";
import requestLogger from "./common/middleware/requestLogger";

const app: Express = express();
app.use(rateLimiter);
app.use(requestLogger);

app.use("/", (req, res) => {
  Logger.info("Default route works");
  res.json({ success: true });
});

app.use(errorHandler);

export default app;
