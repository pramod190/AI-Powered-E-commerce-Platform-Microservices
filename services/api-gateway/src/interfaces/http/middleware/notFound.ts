import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../shared/errors/app-error";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(
    new AppError({
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      statusCode: 404,
      code: "NOT_FOUND"
    })
  );
}

