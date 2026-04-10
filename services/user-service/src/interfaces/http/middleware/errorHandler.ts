import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../../shared/errors/app-error";
import { env } from "../../../config/env";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req as any).id;

  if (err instanceof ZodError) {
    return res.status(400).json({
      requestId,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: err.flatten()
      }
    });
  }

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

  const message = env.NODE_ENV === "production" ? "Internal server error" : (err as any)?.message;
  return res.status(500).json({
    requestId,
    error: {
      code: "INTERNAL_ERROR",
      message: message ?? "Internal server error"
    }
  });
}

