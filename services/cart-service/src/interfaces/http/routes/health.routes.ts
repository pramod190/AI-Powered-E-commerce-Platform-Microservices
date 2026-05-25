import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    service: "ShopHub — Cart Service",
    status: "running",
    version: "1.0.0",
    endpoints: [
      "GET    /cart/:userId",
      "POST   /cart/:userId/items",
      "PUT    /cart/:userId/items/:productId",
      "DELETE /cart/:userId/items/:productId",
      "DELETE /cart/:userId",
      "GET    /health"
    ]
  });
});

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "cart-service",
    timestamp: new Date().toISOString()
  });
});
