import type { PaymentStatus } from "../../domain/payment";

export type CreatePaymentInput = {
  orderId: string;
  userId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
};

export type PaymentPayload = {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  paymentIntentId: string;
};

export interface PaymentRepository {
  /**
   * Create a new payment record.
   */
  create(input: CreatePaymentInput): Promise<PaymentPayload>;

  /**
   * Get payment by ID.
   */
  getById(id: string): Promise<PaymentPayload | null>;

  /**
   * Get payment by payment intent ID (Stripe ID).
   */
  getByPaymentIntentId(paymentIntentId: string): Promise<PaymentPayload | null>;

  /**
   * Get all payments for an order.
   */
  getByOrderId(orderId: string): Promise<PaymentPayload[]>;

  /**
   * Update payment status.
   */
  updateStatus(id: string, status: PaymentStatus): Promise<PaymentPayload>;
}
