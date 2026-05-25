import { Router } from "express";
import mongoose from "mongoose";
import { env } from "../../../config/env";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    service: "ShopHub — Product Service",
    status: "running",
    version: "1.0.0",
    endpoints: [
      "GET  /health",
      "GET  /products",
      "GET  /products/search",
      "GET  /products/:id",
      "POST /products",
      "PATCH /products/:id",
      "DELETE /products/:id"
    ]
  });
});

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: env.SERVICE_NAME,
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

