import mongoose from "mongoose";
import { env } from "../../config/env";
import { logger } from "../../shared/logger";

export async function connectMongo(): Promise<void> {
  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => logger.info("mongo connected"));
  mongoose.connection.on("error", (e) => logger.error({ e }, "mongo connection error"));
  mongoose.connection.on("disconnected", () => logger.warn("mongo disconnected"));

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000
  });
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}

