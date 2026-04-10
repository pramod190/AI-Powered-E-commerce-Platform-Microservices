/**
 * Analytics Service App Factory
 */

import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './shared/logger';
import { requestIdMiddleware } from './middleware/request-id';
import { createHealthRoutes } from './health.routes';
import { createAnalyticsRoutes } from './analytics.routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { IAnalyticsRepository } from './infrastructure/db/analytics-repository';

export function createApp(repository: IAnalyticsRepository): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
    })
  );

  // Logging and compression
  app.use(
    pinoHttp({
      logger,
      genReqId: () => uuidv4(),
    })
  );
  app.use(compression());

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Custom middleware
  app.use(requestIdMiddleware);

  // Routes
  app.use('/', createHealthRoutes());
  app.use('/analytics', createAnalyticsRoutes(repository));

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
