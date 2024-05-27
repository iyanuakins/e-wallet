import { NextFunction, Request, Response } from "express";
import ENV from "../config/envConfig";
import Logger from "../config/logger";

const ErrorHandler = (
  error: { statusCode: number; message: string; stack: any; name?: string },
  request: Request,
  response: Response,
  next: NextFunction
) => {
  Logger.error(
    `statusCode: ${error.statusCode}, message: ${error?.message || error}`
  );

  const isValidationError = error.toString().includes("ValidationError");
  const statusCode = isValidationError ? 406 : error?.statusCode || 500;
  const message = error.message || error || "Unable to process request";

  response.status(statusCode).json({
    success: false,
    error: error.name || "InternalServerErrorException",
    statusCode,
    message,
    stack: ENV.nodeEnv === "development" ? error.stack : {},
  });
};

export default ErrorHandler;
