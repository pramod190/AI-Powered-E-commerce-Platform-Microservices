import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../shared/errors/app-error";
import { env } from "../../../config/env";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req as any).id;

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      requestId,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }

  // Proxy errors from http-proxy-middleware often come through as plain objects
  const anyErr = err as any;
  const message = env.NODE_ENV === "production" ? "Internal server error" : anyErr?.message;

  return res.status(500).json({
    requestId,
    error: {
      code: "INTERNAL_ERROR",
      message: message ?? "Internal server error"
    }
  });
}

