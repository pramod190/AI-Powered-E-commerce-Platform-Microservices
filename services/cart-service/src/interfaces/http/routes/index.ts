import { Router } from "express";
import { z } from "zod";
import * as cartController from "../controllers/cart.controller";
import { asyncHandler } from "../utils/async-handler";
import { validate } from "../middleware/validate";

export const cartRouter = Router();

// ─── Shared param schema ─────────────────────────────────────────────────────

const productIdParam = z.object({ productId: z.string().min(1) });

// ─── Item body schemas ───────────────────────────────────────────────────────

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive("Quantity must be at least 1")
});

const updateItemSchema = z.object({
  quantity: z.number().int().nonnegative("Quantity cannot be negative")
});

// ─── Routes ──────────────────────────────────────────────────────────────────

cartRouter.get("/cart", asyncHandler(cartController.getCartHandler));

cartRouter.post(
  "/cart/items",
  validate({ body: addItemSchema }),
  asyncHandler(cartController.addItemHandler)
);

cartRouter.patch(
  "/cart/items/:productId",
  validate({ params: productIdParam, body: updateItemSchema }),
  asyncHandler(cartController.updateItemHandler)
);

cartRouter.delete(
  "/cart/items/:productId",
  validate({ params: productIdParam }),
  asyncHandler(cartController.removeItemHandler)
);

cartRouter.delete("/cart", asyncHandler(cartController.clearCartHandler));
