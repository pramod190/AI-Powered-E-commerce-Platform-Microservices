import { PrismaClient } from "@prisma/client";
import { logger } from "../../shared/logger";

let prisma: PrismaClient;

export async function initPrisma(): Promise<PrismaClient> {
  prisma = new PrismaClient({
    log: ["error", "warn"]
  });

  try {
    await prisma.$connect();
    logger.info("database connected");
  } catch (error) {
    logger.error({ error }, "failed to connect to database");
    throw error;
  }

  return prisma;
}

export function getPrisma(): PrismaClient {
  return prisma;
}

export async function closePrisma(): Promise<void> {
  await prisma.$disconnect();
}
