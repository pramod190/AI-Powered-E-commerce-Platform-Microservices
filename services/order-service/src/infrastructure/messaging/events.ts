/**
 * Event Type Definitions
 * Shared across all services via messaging layer
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

/**
 * Order Created Event
 * Published when order is created
 */
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

/**
 * Payment Success Event
 * Published when payment is confirmed
 */
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

/**
 * Payment Failed Event
 * Published when payment fails
 */
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

/**
 * Order Cancelled Event
 * Published when order is cancelled
 */
export interface OrderCancelledEvent {
  type: EventType.ORDER_CANCELLED;
  timestamp: number;
  correlationId: string;
  data: {
    orderId: string;
    userId: string;
    reason: string;
  };
}

/**
 * User Registered Event
 * Published when new user signs up
 */
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

/**
 * Union type for all events
 */
export type DomainEvent =
  | OrderCreatedEvent
  | PaymentSuccessEvent
  | PaymentFailedEvent
  | OrderCancelledEvent
  | UserRegisteredEvent;

/**
 * Message Envelope
 * Wraps events for delivery
 */
export interface MessageEnvelope<T extends DomainEvent> {
  id: string;
  type: T['type'];
  timestamp: number;
  correlationId: string;
  version: string;
  payload: T;
}
