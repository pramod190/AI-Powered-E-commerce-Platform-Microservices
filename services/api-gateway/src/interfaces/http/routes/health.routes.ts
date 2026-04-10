import { Router } from "express";
import { env } from "../../../config/env";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: env.SERVICE_NAME,
    timestamp: new Date().toISOString()
  });
});

