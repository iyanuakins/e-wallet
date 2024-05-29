import { HttpStatus } from "./reponses";

interface ErrorInterface {
  statusCode: number;
  name: string;
  message: string;
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
  constructor(message: string, statusCode: HttpStatus) {
    super(message);
    this.name = HttpException.name;
    this.statusCode = statusCode;
  }
}
