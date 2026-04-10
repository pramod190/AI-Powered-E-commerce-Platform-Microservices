/**
 * Copy of Order Service events for Product Service
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

export interface DomainEvent {
  type: EventType;
  timestamp: number;
  correlationId: string;
}

export interface MessageEnvelope<T extends DomainEvent> {
  id: string;
  type: T['type'];
  timestamp: number;
  correlationId: string;
  version: string;
  payload: T;
}
