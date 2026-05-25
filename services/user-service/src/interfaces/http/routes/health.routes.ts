import { Router } from "express";
import { prisma } from "../../../infrastructure/db/prisma";
import { env } from "../../../config/env";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    service: "ShopHub — User Service",
    status: "running",
    version: "1.0.0",
    endpoints: [
      "POST /auth/register",
      "POST /auth/login",
      "GET  /me",
      "GET  /health"
    ]
  });
});

healthRouter.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({
    status: "ok",
    service: env.SERVICE_NAME,
    db: "connected",
    timestamp: new Date().toISOString()
  });
});


