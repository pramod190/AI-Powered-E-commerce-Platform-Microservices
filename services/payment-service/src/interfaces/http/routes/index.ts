import { Router } from "express";
import { z } from "zod";
import * as paymentController from "../controllers/payment.controller";
import { asyncHandler } from "../utils/async-handler";
import { validate } from "../middleware/validate";

export const paymentRouter = Router();

// ─── Schemas ─────────────────────────────────────────────────────────────────

const createPaymentSchema = z.object({
  orderId: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional()
});

// ─── Routes ──────────────────────────────────────────────────────────────────

paymentRouter.post(
  "/payments/intent",
  validate({ body: createPaymentSchema }),
  asyncHandler(paymentController.createPaymentIntentHandler)
);

// Webhook - no validation for raw body (Stripe sends raw bytes)
paymentRouter.post("/webhooks/stripe", asyncHandler(paymentController.handleWebhookHandler));
