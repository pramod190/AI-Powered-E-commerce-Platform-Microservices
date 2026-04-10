/**
 * Update Payment Service to publish PAYMENT_SUCCESS and PAYMENT_FAILED events
 */

import { getEventPublisher } from '../../config/messaging';
import { PaymentSuccessEvent, PaymentFailedEvent, EventType } from '../../infrastructure/messaging/events';

export async function publishPaymentSuccessEvent(
  paymentId: string,
  orderId: string,
  userId: string,
  amount: number,
  stripePaymentIntentId: string,
  correlationId: string
): Promise<void> {
  const publisher = getEventPublisher();

  const event: PaymentSuccessEvent = {
    type: EventType.PAYMENT_SUCCESS,
    timestamp: Date.now(),
    correlationId,
    data: {
      paymentId,
      orderId,
      userId,
      amount,
      stripePaymentIntentId,
    },
  };

  await publisher.publish(event, correlationId);
}

export async function publishPaymentFailedEvent(
  paymentId: string,
  orderId: string,
  userId: string,
  amount: number,
  reason: string,
  correlationId: string
): Promise<void> {
  const publisher = getEventPublisher();

  const event: PaymentFailedEvent = {
    type: EventType.PAYMENT_FAILED,
    timestamp: Date.now(),
    correlationId,
    data: {
      paymentId,
      orderId,
      userId,
      amount,
      reason,
    },
  };

  await publisher.publish(event, correlationId);
}
