import { Router } from "express";
import { prisma } from "../../../infrastructure/db/prisma";
import { env } from "../../../config/env";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  // Minimal DB check: `SELECT 1`
  await prisma.$queryRaw`SELECT 1`;
  res.json({
    status: "ok",
    service: env.SERVICE_NAME,
    timestamp: new Date().toISOString()
  });
});

