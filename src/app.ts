import express, { Express, Request, Response, NextFunction } from "express";
import Logger from "./common/config/logger";
import errorHandler from "./common/middleware/errorHandler";
import rateLimiter from "./common/middleware/rateLimiter";
import requestLogger from "./common/middleware/requestLogger";
import prisma from "./common/config/prisma";
import v1Routes from "./routes/routes.v1";
import HttpException, { HttpExceptionName } from "./common/util/exceptions";
import { HttpStatus } from "./common/util/reponses";

const app: Express = express();
app.disable("x-powered-by");

app.use(rateLimiter);
app.use(requestLogger);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// connect to DB.
(async () => {
  Logger.info("Connecting to DB");
  await prisma.$connect();
  Logger.info("Connected to DB");
})();

app.use("/api/v1", v1Routes);
app.use((request: Request, response: Response, next: NextFunction) => {
  next(
    new HttpException(
      "Route not found",
      HttpStatus.NOT_FOUND,
      HttpExceptionName.NOT_FOUND
    )
  );
});
app.use(errorHandler);

export default app;
