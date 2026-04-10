import type { PaymentPayload, CreatePaymentInput, PaymentRepository } from "../../application/ports/payment-repository";
import { PaymentStatus } from "../../domain/payment";
import { AppError } from "../../shared/errors/app-error";
import crypto from "node:crypto";

/**
 * In-Memory Payment Repository (for development/testing).
 * In production, this should be replaced with a PostgreSQL repository.
 */
export class InMemoryPaymentRepository implements PaymentRepository {
  private payments: Map<string, PaymentPayload> = new Map();
  private paymentsByIntentId: Map<string, string> = new Map(); // paymentIntentId -> paymentId

  async create(input: CreatePaymentInput): Promise<PaymentPayload> {
    const id = crypto.randomUUID();
    const paymentIntentId = `pi_${crypto.randomBytes(8).toString("hex")}`; // Simulated Stripe ID

    const payment: PaymentPayload = {
      id,
      orderId: input.orderId,
      userId: input.userId,
      amount: input.amount,
      status: PaymentStatus.PENDING,
      paymentIntentId: paymentIntentId
    };

    this.payments.set(id, payment);
    this.paymentsByIntentId.set(paymentIntentId, id);

    return payment;
  }

  async getById(id: string): Promise<PaymentPayload | null> {
    return this.payments.get(id) || null;
  }

  async getByPaymentIntentId(paymentIntentId: string): Promise<PaymentPayload | null> {
    const paymentId = this.paymentsByIntentId.get(paymentIntentId);
    if (!paymentId) return null;
    return this.payments.get(paymentId) || null;
  }

  async getByOrderId(orderId: string): Promise<PaymentPayload[]> {
    return Array.from(this.payments.values()).filter((p) => p.orderId === orderId);
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<PaymentPayload> {
    const payment = this.payments.get(id);

    if (!payment) {
      throw new AppError({
        message: "Payment not found",
        statusCode: 404,
        code: "PAYMENT_NOT_FOUND"
      });
    }

    const updated = { ...payment, status };
    this.payments.set(id, updated);

    return updated;
  }
}
