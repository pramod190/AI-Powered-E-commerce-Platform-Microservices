// @ts-nocheck
import { Router } from 'express'
import { logger } from './shared/logger'

export function createHealthRoutes() {
  const router = Router()

  router.get('/health', (req, res) => {
    logger.debug('Health check')
    res.status(200).json({
      status: 'ok',
      service: 'analytics-service',
      timestamp: new Date().toISOString(),
    })
  })

  router.get('/ready', (req, res) => {
    res.status(200).json({
      status: 'ready',
      service: 'analytics-service',
    })
  })

  return router
}
