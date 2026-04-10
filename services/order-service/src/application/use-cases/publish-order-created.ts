/**
 * Update Order Service to publish ORDER_CREATED event
 */

import { CreateOrderUseCase } from '../create-order';
import { getEventPublisher } from '../../config/messaging';
import { OrderCreatedEvent, EventType } from '../../infrastructure/messaging/events';
import { Order } from '../../domain/order';

/**
 * Enhanced CreateOrderUseCase that publishes event
 */
export async function publishOrderCreatedEvent(
  order: Order,
  correlationId: string
): Promise<void> {
  const publisher = getEventPublisher();

  const event: OrderCreatedEvent = {
    type: EventType.ORDER_CREATED,
    timestamp: Date.now(),
    correlationId,
    data: {
      orderId: order.id,
      userId: order.userId,
      totalAmount: order.totalAmount,
      items: order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      status: order.status as 'PENDING',
    },
  };

  await publisher.publish(event, correlationId);
}
