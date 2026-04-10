import type { PaymentPayload, PaymentRepository } from "../ports/payment-repository";
import { AppError } from "../../shared/errors/app-error";
import { PaymentStatus } from "../../domain/payment";

export class ConfirmPaymentFailed {
  constructor(private readonly repo: PaymentRepository) {}

  async execute(paymentIntentId: string, reason: string): Promise<PaymentPayload> {
    const payment = await this.repo.getByPaymentIntentId(paymentIntentId);

    if (!payment) {
      throw new AppError({
        message: "Payment not found",
        statusCode: 404,
        code: "PAYMENT_NOT_FOUND"
      });
    }

    if (payment.status === PaymentStatus.FAILED) {
      // Already marked as failed
      return payment;
    }

    // Update payment status to failed
    const updatedPayment = await this.repo.updateStatus(payment.id, PaymentStatus.FAILED);

    return updatedPayment;
  }
}
