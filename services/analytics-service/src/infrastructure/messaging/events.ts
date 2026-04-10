/**
 * Shared event types for Analytics Service
 */

export enum EventType {
  ORDER_CREATED = 'order.created',
  ORDER_CONFIRMED = 'order.confirmed',
  ORDER_SHIPPED = 'order.shipped',
  ORDER_DELIVERED = 'order.delivered',
  ORDER_CANCELLED = 'order.cancelled',
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
  USER_REGISTERED = 'user.registered',
  ITEM_ADDED_TO_CART = 'item.added_to_cart',
}

export interface OrderCreatedEvent {
  type: EventType.ORDER_CREATED;
  timestamp: number;
  correlationId: string;
  data: {
    orderId: string;
    userId: string;
    totalAmount: number;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    status: 'PENDING';
  };
}

export interface PaymentSuccessEvent {
  type: EventType.PAYMENT_SUCCESS;
  timestamp: number;
  correlationId: string;
  data: {
    paymentId: string;
    orderId: string;
    userId: string;
    amount: number;
    stripePaymentIntentId: string;
  };
}

export interface PaymentFailedEvent {
  type: EventType.PAYMENT_FAILED;
  timestamp: number;
  correlationId: string;
  data: {
    paymentId: string;
    orderId: string;
    userId: string;
    amount: number;
    reason: string;
  };
}

export interface UserRegisteredEvent {
  type: EventType.USER_REGISTERED;
  timestamp: number;
  correlationId: string;
  data: {
    userId: string;
    email: string;
    createdAt: number;
  };
}

export type DomainEvent =
  | OrderCreatedEvent
  | PaymentSuccessEvent
  | PaymentFailedEvent
  | UserRegisteredEvent;

export interface MessageEnvelope<T extends DomainEvent> {
  id: string;
  type: T['type'];
  timestamp: number;
  correlationId: string;
  version: string;
  payload: T;
}
