// @ts-nocheck
/**
 * Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/app-error';
import { logger } from '../../shared/logger';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof AppError) {
    logger.error('Application error', {
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
      details: error.details,
    });

    res.status(error.statusCode).json({
      error: error.code,
      message: error.message,
      details: error.details,
    });
  } else {
    logger.error('Unexpected error', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
  });
}
