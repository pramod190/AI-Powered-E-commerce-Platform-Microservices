import Stripe from "stripe";
import { getStripe } from "./stripe";
import { AppError } from "../../shared/errors/app-error";
import { PaymentStatus } from "../../domain/payment";

export type CreatePaymentIntentInput = {
  orderId: string;
  userId: string;
  amount: number; // in cents
  customerEmail: string;
  customerName: string;
};

export type PaymentIntentResult = {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  status: PaymentStatus;
};

export class StripePaymentProvider {
  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    const stripe = getStripe();

    try {
      // Create or retrieve Stripe customer
      const customers = await stripe.customers.list({
        email: input.customerEmail,
        limit: 1
      });

      let customerId: string;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: input.customerEmail,
          name: input.customerName,
          metadata: {
            userId: input.userId
          }
        });
        customerId = customer.id;
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: input.amount,
        currency: "usd",
        customer: customerId,
        metadata: {
          orderId: input.orderId,
          userId: input.userId
        },
        description: `Order ${input.orderId}`,
        automatic_payment_methods: {
          enabled: true
        }
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || "",
        amount: paymentIntent.amount,
        status: this.mapStripeStatusToPaymentStatus(paymentIntent.status)
      };
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new AppError({
          message: `Stripe error: ${error.message}`,
          statusCode: 400,
          code: "STRIPE_ERROR",
          details: { stripeCode: error.code }
        });
      }
      throw error;
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    const stripe = getStripe();

    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new AppError({
          message: `Failed to retrieve payment intent: ${error.message}`,
          statusCode: 400,
          code: "STRIPE_ERROR"
        });
      }
      throw error;
    }
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    const stripe = getStripe();

    try {
      return await stripe.refunds.create({
        payment_intent: paymentIntentId,
        ...(amount && { amount })
      });
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new AppError({
          message: `Refund failed: ${error.message}`,
          statusCode: 400,
          code: "STRIPE_REFUND_ERROR"
        });
      }
      throw error;
    }
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private mapStripeStatusToPaymentStatus(stripeStatus: string): PaymentStatus {
    switch (stripeStatus) {
      case "requires_payment_method":
      case "requires_confirmation":
        return PaymentStatus.PENDING;
      case "processing":
        return PaymentStatus.PROCESSING;
      case "succeeded":
        return PaymentStatus.SUCCEEDED;
      case "requires_action":
        return PaymentStatus.PROCESSING;
      case "canceled":
        return PaymentStatus.CANCELLED;
      default:
        return PaymentStatus.PENDING;
    }
  }
}

export const stripePaymentProvider = new StripePaymentProvider();
