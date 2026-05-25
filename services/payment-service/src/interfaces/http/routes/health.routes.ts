import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    service: "ShopHub — Payment Service",
    status: "running",
    version: "1.0.0",
    endpoints: [
      "POST   /payments/intent",
      "GET    /payments/:paymentId",
      "POST   /payments/webhook",
      "GET    /health"
    ]
  });
});

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "payment-service",
    timestamp: new Date().toISOString()
  });
});
