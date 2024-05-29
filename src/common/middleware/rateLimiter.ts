import { Request } from "express";
import { rateLimit } from "express-rate-limit";

import ENV from "../config/env";

const rateLimiter = rateLimit({
  legacyHeaders: true,
  limit: ENV.rateLimitMaxRequest,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  windowMs: ENV.rateLimitWindowsMs,
  keyGenerator: (request: Request) =>
    (request.headers["x-forwarded-for"] ||
      request.socket.localAddress) as string,
});

export default rateLimiter;
