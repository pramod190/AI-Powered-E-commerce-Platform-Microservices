import { Router } from "express";
import { z } from "zod";
import * as orderController from "../controllers/order.controller";
import { asyncHandler } from "../utils/async-handler";
import { validate } from "../middleware/validate";

export const orderRouter = Router();

// ─── Schemas ─────────────────────────────────────────────────────────────────

const idParam = z.object({ id: z.string().min(1) });

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"])
});

// ─── Routes ──────────────────────────────────────────────────────────────────

orderRouter.post("/orders", asyncHandler(orderController.createOrderHandler));

orderRouter.get("/orders/:id", validate({ params: idParam }), asyncHandler(orderController.getOrderHandler));

orderRouter.get("/orders", asyncHandler(orderController.getUserOrdersHandler));

orderRouter.patch(
  "/orders/:id/status",
  validate({ params: idParam, body: updateStatusSchema }),
  asyncHandler(orderController.updateOrderStatusHandler)
);
