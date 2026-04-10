import { Router } from "express";
import mongoose from "mongoose";
import { env } from "../../../config/env";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: env.SERVICE_NAME,
    mongo: mongoose.connection.readyState, // 1 = connected
    timestamp: new Date().toISOString()
  });
});

