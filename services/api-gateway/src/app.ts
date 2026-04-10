import express, { type Express } from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { env } from "./config/env";
import { apiRouter } from "./interfaces/http/routes";
import { errorHandler } from "./interfaces/http/middleware/errorHandler";
import { notFoundHandler } from "./interfaces/http/middleware/notFound";
import { logger } from "./shared/logger";
import { requestId } from "./interfaces/http/middleware/request-id";
import { rateLimiter } from "./interfaces/http/middleware/rate-limit";

export function buildApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  // Logging middleware (structured logs with request id)
  app.use(requestId());
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as any).id,
      customProps: (req) => ({ requestId: (req as any).id })
    })
  );

  // Security & performance middleware
  app.use(helmet());
  app.use(compression());

  const origins = env.CORS_ORIGINS.length ? env.CORS_ORIGINS : undefined;
  app.use(cors({ origin: origins, credentials: true }));

  // Rate limiting (apply at gateway boundary)
  app.use(rateLimiter());

  // Proxy does not require JSON body parsing globally; leaving it off avoids interfering with streaming/file uploads.
  // Add `express.json()` only for endpoints implemented by the gateway itself (e.g. auth, health, etc).
  app.use(express.json({ limit: "1mb" }));

  app.use(apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

