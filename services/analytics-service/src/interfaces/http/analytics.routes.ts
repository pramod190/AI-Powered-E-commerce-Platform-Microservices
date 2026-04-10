/**
 * Analytics Routes
 */

import express from 'express';
import { IAnalyticsRepository } from '../db/analytics-repository';
import { logger } from '../shared/logger';

interface DailyMetricsResponse {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  averageOrderValue: number;
  newUsers: number;
}

export function createAnalyticsRoutes(
  repository: IAnalyticsRepository
): express.Router {
  const router = express.Router();

  /**
   * Get daily metrics
   * GET /analytics/metrics/daily?date=2024-01-15
   */
  router.get('/metrics/daily', async (req, res, next) => {
    try {
      const dateStr = req.query.date as string;
      if (!dateStr) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'date query parameter is required',
        });
      }

      const date = new Date(dateStr);
      const metrics = await repository.getDailyMetrics(date);

      if (!metrics) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'No metrics found for the specified date',
        });
      }

      res.json(metrics as DailyMetricsResponse);
      logger.info('Retrieved daily metrics', { date: dateStr });
    } catch (error) {
      next(error);
    }
  });

  /**
   * Get metrics range
   * GET /analytics/metrics/range?startDate=2024-01-01&endDate=2024-01-31
   */
  router.get('/metrics/range', async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query as {
        startDate?: string;
        endDate?: string;
      };

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'startDate and endDate query parameters are required',
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      const metrics = await repository.getMetricsRange(start, end);

      res.json(metrics as DailyMetricsResponse[]);
      logger.info('Retrieved metrics range', { startDate, endDate });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
