import { HttpStatus } from "./reponses";

interface ErrorInterface {
  statusCode: number;
  name: string;
  message: string;
}

export enum HttpExceptionName {
  BAD_REQUEST = "BadRequestException",
  NOT_FOUND = "NotFoundException",
  INTERNAL_SERVER_ERROR = "InternalServerErrorException",
}

class BaseException extends Error implements ErrorInterface {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = BaseException.name;
    this.statusCode = 500;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default class HttpException extends BaseException {
  statusCode: number;
  constructor(message: string, statusCode: HttpStatus, name: string = "") {
    super(message);
    this.name = name || HttpException.name;
    this.statusCode = statusCode;
  }
}
