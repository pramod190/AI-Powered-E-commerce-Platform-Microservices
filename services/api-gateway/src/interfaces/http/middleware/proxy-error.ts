import type { RequestHandler } from "express";
import type { ErrorRequestHandler } from "express";
import { AppError } from "../../../shared/errors/app-error";
import { logger } from "../../../shared/logger";

// This is attached to each proxy middleware via `on.error` to forward errors into Express.
export function proxyOnError(next: Parameters<RequestHandler>[2]) {
  return (err: any, _req: any, _res: any, _target?: any) => {
    logger.error({ err }, "proxy error");
    next(
      new AppError({
        statusCode: 502,
        code: "BAD_GATEWAY",
        message: "Upstream service unavailable"
      })
    );
  };
}

// Express can also catch errors thrown in sync middleware.
export const proxyErrorFallback: ErrorRequestHandler = (err, _req, _res, next) => {
  next(err);
};

