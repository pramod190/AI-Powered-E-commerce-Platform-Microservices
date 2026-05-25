/**
 * Payment Service - Message Broker Configuration
 */
// @ts-nocheck

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
  eventConsumer = new EventConsumer(messageBroker, 'payment-service');

  try {
    await messageBroker.connect();
    await eventPublisher.initialize();
    await eventConsumer.initialize();

    // Subscribe to Order Created event (for stock validation, etc.)
    eventConsumer.subscribe(EventType.ORDER_CREATED, handleOrderCreated);

    await eventConsumer.startConsuming();

    logger.info('Payment Service messaging initialized');
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
 * Handle Order Created Event
 * Payment service can listen for order creation
 */
async function handleOrderCreated(event: any): Promise<void> {
  logger.info('Processing ORDER_CREATED event', {
    orderId: event.data.orderId,
    totalAmount: event.data.totalAmount,
  });
  // Payment service can implement additional logic here
  // E.g., reserve funds, check fraud, etc.
}

/**
 * Shutdown messaging
 */
export async function shutdownMessaging(): Promise<void> {
  if (messageBroker) {
    await messageBroker.disconnect();
  }
}
