import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { env } from "../../../config/env";

export const healthRouter = Router();

healthRouter.get(
  "/health",
  validate({
    query: z.object({}).optional()
  }),
  asyncHandler(async (_req, res) => {
    res.json({
      status: "ok",
      service: env.SERVICE_NAME,
      timestamp: new Date().toISOString()
    });
  })
);

