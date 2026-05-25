// @ts-nocheck
import { Request, Response, NextFunction } from 'express'
import { logger } from '../shared/logger'

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error({ err, path: req.path }, 'Unhandled error')
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
}

export function notFoundHandler(req: Request, res: Response) {
  logger.warn({ path: req.path }, 'Route not found')
  res.status(404).json({
    error: 'Not found',
  })
}
