import http from "node:http";
import { env } from "./config/env";
import { buildApp } from "./app";
import { logger } from "./shared/logger";
import { connectMongo, disconnectMongo } from "./infrastructure/db/mongoose";

async function main() {
  await connectMongo();

  const app = buildApp();
  const server = http.createServer(app);

  server.on("error", (err: any) => {
    if (err?.code === "EADDRINUSE") {
      logger.error({ port: env.PORT }, "port already in use (try changing PORT in .env)");
      process.exit(1);
    }
    logger.error({ err }, "server error");
    process.exit(1);
  });

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, service: env.SERVICE_NAME }, "server listening");
  });

  const shutdown = async (signal: string) => {
    logger.warn({ signal }, "shutdown signal received");
    server.close(async (err) => {
      if (err) {
        logger.error({ err }, "error during shutdown");
        process.exit(1);
      }
      await disconnectMongo().catch((e: unknown) => logger.error({ e }, "mongo disconnect failed"));
      logger.info("shutdown complete");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((e: unknown) => {
  logger.error({ e }, "fatal startup error");
  process.exit(1);
});

