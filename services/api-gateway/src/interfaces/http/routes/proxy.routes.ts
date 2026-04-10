import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../../../config/env";
import { proxyOnError } from "../middleware/proxy-error";

export const proxyRouter = Router();

// Important: mount the gateway routes exactly as required.
// `/api/users` -> user-service
// `/api/products` -> product-service

proxyRouter.use("/api/users", (req, res, next) => {
  return createProxyMiddleware({
    target: env.USER_SERVICE_URL,
    changeOrigin: true,
    xfwd: true,
    // keep path: /api/users/... (recommended when user-service routes are namespaced similarly)
    on: {
      error: proxyOnError(next)
    }
  })(req, res, next);
});

proxyRouter.use("/api/products", (req, res, next) => {
  return createProxyMiddleware({
    target: env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    xfwd: true,
    on: {
      error: proxyOnError(next)
    }
  })(req, res, next);
});

