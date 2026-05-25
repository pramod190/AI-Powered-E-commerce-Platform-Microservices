import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    service: "ShopHub — Order Service",
    status: "running",
    version: "1.0.0",
    endpoints: [
      "POST   /orders",
      "GET    /orders/user/:userId",
      "GET    /orders/:orderId",
      "PATCH  /orders/:orderId/status",
      "GET    /health"
    ]
  });
});

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "order-service",
    timestamp: new Date().toISOString()
  });
});
