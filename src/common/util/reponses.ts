import { Response } from "express";
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  NOT_ACCEPTABLE = 406,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}

export const SuccessResponse = (
  response: Response,
  status: HttpStatus = HttpStatus.OK,
  message: string,
  data?: object,
  meta?: object
) => {
  return response.status(status).json({
    success: true,
    message,
    data,
    meta,
  });
};
