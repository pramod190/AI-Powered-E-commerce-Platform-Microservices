// @ts-nocheck
/**
 * Analytics Event Consumer
 */

import { MessageBroker, BrokerConfig } from './message-broker';
import { EventConsumer } from './event-consumer';
import { EventType, OrderCreatedEvent, PaymentSuccessEvent, PaymentFailedEvent } from './events';
import { logger } from '../logger';
import { AnalyticsRepository } from '../db/analytics-repository';

let messageBroker: MessageBroker | null = null;
let eventConsumer: EventConsumer | null = null;

export async function initializeAnalyticsConsumer(
  repository: AnalyticsRepository
): Promise<void> {
  const brokerConfig: BrokerConfig = {
    url: process.env.RABBITMQ_URL || 'amqp://localhost',
    reconnectDelay: 5000,
    maxRetries: 5,
  };

  messageBroker = new MessageBroker(brokerConfig);
  eventConsumer = new EventConsumer(messageBroker, 'analytics-service');

  try {
    await messageBroker.connect();
    await eventConsumer.initialize();

    // Subscribe to all relevant events
    eventConsumer.subscribe(
      EventType.ORDER_CREATED,
      (event: OrderCreatedEvent) => handleOrderCreated(event, repository)
    );

    eventConsumer.subscribe(
      EventType.PAYMENT_SUCCESS,
      (event: PaymentSuccessEvent) => handlePaymentSuccess(event, repository)
    );

    eventConsumer.subscribe(
      EventType.PAYMENT_FAILED,
      (event: PaymentFailedEvent) => handlePaymentFailed(event, repository)
    );

    eventConsumer.subscribe(
      EventType.USER_REGISTERED,
      (event: any) => handleUserRegistered(event, repository)
    );

    await eventConsumer.startConsuming();

    logger.info('Analytics consumer initialized and listening');
  } catch (error) {
    logger.error('Failed to initialize analytics consumer', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function handleOrderCreated(
  event: OrderCreatedEvent,
  repository: AnalyticsRepository
): Promise<void> {
  logger.info('Recording order analytics', { orderId: event.data.orderId });

  await repository.recordOrderAnalytics({
    orderId: event.data.orderId,
    userId: event.data.userId,
    totalAmount: event.data.totalAmount,
    itemCount: event.data.items.length,
    timestamp: event.timestamp,
    status: 'pending',
  });

  // Update daily metrics
  await repository.incrementDailyMetrics(new Date(event.timestamp), {
    totalOrders: 1,
    totalRevenue: event.data.totalAmount,
  });
}

async function handlePaymentSuccess(
  event: PaymentSuccessEvent,
  repository: AnalyticsRepository
): Promise<void> {
  logger.info('Recording payment success analytics', {
    paymentId: event.data.paymentId,
  });

  await repository.recordPaymentAnalytics({
    paymentId: event.data.paymentId,
    orderId: event.data.orderId,
    userId: event.data.userId,
    amount: event.data.amount,
    status: 'succeeded',
    timestamp: event.timestamp,
  });

  // Update daily metrics
  await repository.incrementDailyMetrics(new Date(event.timestamp), {
    successfulPayments: 1,
  });
}

async function handlePaymentFailed(
  event: PaymentFailedEvent,
  repository: AnalyticsRepository
): Promise<void> {
  logger.info('Recording payment failed analytics', {
    paymentId: event.data.paymentId,
  });

  await repository.recordPaymentAnalytics({
    paymentId: event.data.paymentId,
    orderId: event.data.orderId,
    userId: event.data.userId,
    amount: event.data.amount,
    status: 'failed',
    timestamp: event.timestamp,
  });

  // Update daily metrics
  await repository.incrementDailyMetrics(new Date(event.timestamp), {
    failedPayments: 1,
  });
}

async function handleUserRegistered(
  event: any,
  repository: AnalyticsRepository
): Promise<void> {
  logger.info('Recording user registration analytics', {
    userId: event.data.userId,
  });

  await repository.recordUserAnalytics({
    userId: event.data.userId,
    email: event.data.email,
    registeredAt: event.timestamp,
    lastActivityAt: event.timestamp,
  });

  // Update daily metrics
  await repository.incrementDailyMetrics(new Date(event.timestamp), {
    newUsers: 1,
  });
}

export async function shutdownAnalyticsConsumer(): Promise<void> {
  if (messageBroker) {
    await messageBroker.disconnect();
  }
}
