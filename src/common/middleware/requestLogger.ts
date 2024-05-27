import { Request } from "express";
import morgan = require("morgan");
import Logger from "../config/logger";

const stringify = (name: string, payload: Record<string, any> | undefined) =>
  `${name}: ${JSON.stringify(payload || {})}`;

morgan.token("request-body", (request: Request) =>
  stringify("BODY", request.body)
);

morgan.token("request-header", (request: Request) =>
  stringify("HEADER", request.headers)
);

morgan.token("request-params", (request: Request) =>
  stringify("PARAMS", request.params)
);

morgan.token("request-query", (request: Request) =>
  stringify("QUERY", request.query)
);

export default morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time \n :request-body \n :request-header \n :request-query \n :request-params',
  {
    stream: { write: (message) => Logger.info(message.trim()) },
  }
);
