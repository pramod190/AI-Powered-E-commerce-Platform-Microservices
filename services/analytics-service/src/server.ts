/**
 * Analytics Service Server
 */

import 'dotenv/config';
import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './shared/logger';
import { InMemoryAnalyticsRepository } from './infrastructure/db/analytics-repository';

const repository = new InMemoryAnalyticsRepository();
const app = createApp(repository);
const server = http.createServer(app);

server.listen(env.PORT, () => {
  logger.info(`Analytics Service listening on port ${env.PORT}`);
});

server.on('error', (err: any) => {
  if (err?.code === 'EADDRINUSE') {
    logger.error(`Port ${env.PORT} is already in use`);
    process.exit(1);
  }
  logger.error('Server error', { err });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
