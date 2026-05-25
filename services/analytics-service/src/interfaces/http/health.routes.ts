/**
 * Health Check Routes
 */

import express from 'express';

export function createHealthRoutes(): express.Router {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.status(200).json({
      service: 'ShopHub — Analytics Service',
      status: 'running',
      version: '1.0.0',
      endpoints: [
        'GET  /health',
        'GET  /ready',
        'GET  /analytics/revenue',
        'GET  /analytics/orders',
        'GET  /analytics/metrics'
      ]
    });
  });

  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'analytics-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  router.get('/ready', (req, res) => {
    res.status(200).json({
      ready: true,
      service: 'analytics-service',
    });
  });

  return router;
}
