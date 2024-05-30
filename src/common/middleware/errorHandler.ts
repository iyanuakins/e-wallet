import { NextFunction, Request, Response } from "express";
import ENV from "../config/env";
import Logger from "../config/logger";
import { HttpExceptionName } from "../utils/exceptions";
import { HttpStatus } from "../utils/reponses";

const ErrorHandler = (
  error: { statusCode: number; message: string; stack: any; name?: string },
  request: Request,
  response: Response,
  next: NextFunction
) => {
  Logger.error(
    `statusCode: ${error.statusCode}, message: ${
      error?.message || error
    }, stack: ${error?.stack}`
  );

  const isValidationError = error.toString().includes("ValidationError");
  const statusCode = isValidationError
    ? HttpStatus.NOT_ACCEPTABLE
    : error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = error.message || error || "Unable to process request";

  response.status(statusCode).json({
    success: false,
    error: error.name || HttpExceptionName.INTERNAL_SERVER_ERROR,
    statusCode,
    message,
    stack: ENV.nodeEnv === "development" ? error.stack : {},
  });
};

export default ErrorHandler;
