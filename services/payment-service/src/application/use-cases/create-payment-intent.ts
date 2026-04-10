import type { PaymentPayload, CreatePaymentInput } from "../ports/payment-repository";
import type { PaymentRepository } from "../ports/payment-repository";
import { stripePaymentProvider, type CreatePaymentIntentInput } from "../../infrastructure/payment-provider/stripe-provider";
import { AppError } from "../../shared/errors/app-error";

export class CreatePaymentIntent {
  constructor(private readonly repo: PaymentRepository) {}

  async execute(input: CreatePaymentInput): Promise<PaymentPayload & { clientSecret: string }> {
    // Validate amount
    if (input.amount <= 0) {
      throw new AppError({
        message: "Amount must be greater than 0",
        statusCode: 400,
        code: "INVALID_AMOUNT"
      });
    }

    // Create payment record first
    const payment = await this.repo.create(input);

    try {
      // Create Stripe payment intent
      const stripeInput: CreatePaymentIntentInput = {
        orderId: input.orderId,
        userId: input.userId,
        amount: input.amount * 100, // Convert to cents
        customerEmail: input.customerEmail,
        customerName: input.customerName
      };

      const paymentIntent = await stripePaymentProvider.createPaymentIntent(stripeInput);

      // Update payment record with Stripe payment intent ID
      const updatedPayment = await this.repo.updateStatus(payment.id, payment.status);

      return {
        ...updatedPayment,
        clientSecret: paymentIntent.clientSecret
      };
    } catch (error) {
      throw error;
    }
  }
}
