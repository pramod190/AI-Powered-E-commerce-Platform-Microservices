/**
 * Order Service - Message Broker Configuration
 */

import { MessageBroker, BrokerConfig } from '../infrastructure/messaging/message-broker';
import { EventPublisher } from '../infrastructure/messaging/event-publisher';
import { EventConsumer } from '../infrastructure/messaging/event-consumer';
import { EventType } from '../infrastructure/messaging/events';
import { logger } from '../shared/logger';

let messageBroker: MessageBroker | null = null;
let eventPublisher: EventPublisher | null = null;
let eventConsumer: EventConsumer | null = null;

/**
 * Initialize messaging infrastructure
 */
export async function initializeMessaging(): Promise<void> {
  const brokerConfig: BrokerConfig = {
    url: process.env.RABBITMQ_URL || 'amqp://localhost',
    reconnectDelay: 5000,
    maxRetries: 5,
  };

  messageBroker = new MessageBroker(brokerConfig);
  eventPublisher = new EventPublisher(messageBroker);
  eventConsumer = new EventConsumer(messageBroker, 'order-service');

  try {
    await messageBroker.connect();
    await eventPublisher.initialize();
    await eventConsumer.initialize();

    // Subscribe to Payment Success/Failed events
    eventConsumer.subscribe(EventType.PAYMENT_SUCCESS, handlePaymentSuccess);
    eventConsumer.subscribe(EventType.PAYMENT_FAILED, handlePaymentFailed);

    await eventConsumer.startConsuming();

    logger.info('Order Service messaging initialized');
  } catch (error) {
    logger.error('Failed to initialize messaging', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get event publisher
 */
export function getEventPublisher(): EventPublisher {
  if (!eventPublisher) {
    throw new Error('Event publisher not initialized');
  }
  return eventPublisher;
}

/**
 * Get event consumer
 */
export function getEventConsumer(): EventConsumer {
  if (!eventConsumer) {
    throw new Error('Event consumer not initialized');
  }
  return eventConsumer;
}

/**
 * Get message broker
 */
export function getMessageBroker(): MessageBroker {
  if (!messageBroker) {
    throw new Error('Message broker not initialized');
  }
  return messageBroker;
}

/**
 * Handle Payment Success Event
 * Update order status to PAID
 */
async function handlePaymentSuccess(event: any): Promise<void> {
  logger.info('Processing PAYMENT_SUCCESS event', {
    orderId: event.data.orderId,
  });
  // Payment Service already updates order status
  // This is here for potential future processing (e.g., trigger inventory deduction)
}

/**
 * Handle Payment Failed Event
 * Update order status to CANCELLED
 */
async function handlePaymentFailed(event: any): Promise<void> {
  logger.info('Processing PAYMENT_FAILED event', {
    orderId: event.data.orderId,
  });
  // Payment Service would handle order status update
  // This could trigger notifications to user
}

/**
 * Shutdown messaging
 */
export async function shutdownMessaging(): Promise<void> {
  if (messageBroker) {
    await messageBroker.disconnect();
  }
}
