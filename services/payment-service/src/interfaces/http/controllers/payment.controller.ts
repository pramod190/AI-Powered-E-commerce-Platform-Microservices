import type { Request, Response } from "express";
import { InMemoryPaymentRepository } from "../../../infrastructure/repositories/in-memory-payment-repository";
import { CreatePaymentIntent } from "../../../application/use-cases/create-payment-intent";
import { ConfirmPaymentSuccess } from "../../../application/use-cases/confirm-payment-success";
import { ConfirmPaymentFailed } from "../../../application/use-cases/confirm-payment-failed";
import { orderServiceClient } from "../../../infrastructure/http-client/order-service";
import { AppError } from "../../../shared/errors/app-error";

const repo = new InMemoryPaymentRepository();

const createPaymentIntent = new CreatePaymentIntent(repo);
const confirmPaymentSuccess = new ConfirmPaymentSuccess(repo);
const confirmPaymentFailed = new ConfirmPaymentFailed(repo);

export async function createPaymentIntentHandler(req: Request, res: Response) {
  const orderId = req.body.orderId as string;
  if (!orderId) {
    throw new AppError({
      message: "Order ID is required",
      statusCode: 400,
      code: "MISSING_ORDER_ID"
    });
  }

  // Fetch order to get total and user info
  const order = await orderServiceClient.getOrder(orderId);

  if (!order) {
    throw new AppError({
      message: "Order not found",
      statusCode: 404,
      code: "ORDER_NOT_FOUND"
    });
  }

  const customerEmail = req.body.customerEmail || `user-${order.userId}@example.com`;
  const customerName = req.body.customerName || `User ${order.userId}`;

  const result = await createPaymentIntent.execute({
    orderId,
    userId: order.userId,
    amount: order.total,
    customerEmail,
    customerName
  });

  res.status(201).json({ payment: result });
}

export async function handleWebhookHandler(req: Request, res: Response) {
  const event = req.body;

  // In production, verify webhook signature with Stripe
  // const sig = req.headers['stripe-signature'];
  // const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntentId = event.data.object.id;
        await confirmPaymentSuccess.execute(paymentIntentId);
        res.json({ received: true });
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntentId = event.data.object.id;
        const reason = event.data.object.last_payment_error?.message || "Unknown error";
        await confirmPaymentFailed.execute(paymentIntentId, reason);
        res.json({ received: true });
        break;
      }

      default:
        // Unhandled event type
        res.json({ received: true });
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(400).json({ error: "Webhook processing failed" });
  }
}
