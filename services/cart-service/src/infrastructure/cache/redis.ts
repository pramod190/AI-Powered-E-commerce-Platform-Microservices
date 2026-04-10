import { createClient, type RedisClientType } from "redis";
import { env } from "../../config/env";
import { logger } from "../../shared/logger";

let redisClient: RedisClientType;

export async function initRedis(): Promise<RedisClientType> {
  redisClient = createClient({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    db: env.REDIS_DB,
    password: env.REDIS_PASSWORD || undefined,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500)
    }
  });

  redisClient.on("error", (err) => logger.error({ err }, "redis error"));
  redisClient.on("connect", () => logger.info("redis connected"));
  redisClient.on("ready", () => logger.info("redis ready"));
  redisClient.on("reconnecting", () => logger.warn("redis reconnecting"));

  await redisClient.connect();
  return redisClient;
}

export function getRedis(): RedisClientType {
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  await redisClient.disconnect();
}
