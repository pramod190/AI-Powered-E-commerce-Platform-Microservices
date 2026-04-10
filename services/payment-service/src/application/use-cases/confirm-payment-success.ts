import type { PaymentPayload, PaymentRepository } from "../ports/payment-repository";
import { orderServiceClient } from "../../infrastructure/http-client/order-service";
import { AppError } from "../../shared/errors/app-error";
import { PaymentStatus } from "../../domain/payment";

export class ConfirmPaymentSuccess {
  constructor(private readonly repo: PaymentRepository) {}

  async execute(paymentIntentId: string): Promise<PaymentPayload> {
    // Get payment by intent ID
    const payment = await this.repo.getByPaymentIntentId(paymentIntentId);

    if (!payment) {
      throw new AppError({
        message: "Payment not found",
        statusCode: 404,
        code: "PAYMENT_NOT_FOUND"
      });
    }

    if (payment.status === PaymentStatus.SUCCEEDED) {
      // Already processed
      return payment;
    }

    // Update payment status to succeeded
    const updatedPayment = await this.repo.updateStatus(payment.id, PaymentStatus.SUCCEEDED);

    try {
      // Update order status to PAID
      await orderServiceClient.updateOrderStatus(payment.orderId, "PAID");
    } catch (error) {
      // Log but don't fail - payment succeeded, order update is secondary
      console.error("Failed to update order status, but payment succeeded:", error);
    }

    return updatedPayment;
  }
}
