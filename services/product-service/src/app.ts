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

export function buildApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(requestId());
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as any).id,
      customProps: (req) => ({ requestId: (req as any).id })
    })
  );

  app.use(helmet());
  app.use(compression() as any);
  app.use(express.json({ limit: "1mb" }));

  const configuredOrigins = env.CORS_ORIGINS.length ? env.CORS_ORIGINS : [];
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        // Allow any Vercel deployment URL
        if (/\.vercel\.app$/.test(origin)) return callback(null, true);
        // Allow any explicitly configured origin
        if (configuredOrigins.length === 0 || configuredOrigins.includes(origin)) {
          return callback(null, true);
        }
        callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    })
  );

  app.use(apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

