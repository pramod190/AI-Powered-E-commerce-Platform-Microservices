/**
 * Event Consumer
 * Consumes and handles domain events from message broker
 */
// @ts-nocheck
import { ConsumeMessage } from 'amqplib';
import { MessageBroker } from './message-broker';
import { DomainEvent, MessageEnvelope, EventType } from './events';
import { logger } from '../../shared/logger';

export type EventHandler<T extends DomainEvent> = (
  event: T,
  envelope: MessageEnvelope<T>
) => Promise<void>;

interface ConsumerSubscription {
  eventType: EventType;
  handler: EventHandler<any>;
}

export class EventConsumer {
  private subscriptions: Map<string, ConsumerSubscription> = new Map();
  private queueName: string;

  constructor(
    private messageBroker: MessageBroker,
    serviceName: string
  ) {
    this.queueName = `${serviceName}.events`;
  }

  /**
   * Initialize event consumer
   */
  async initialize(): Promise<void> {
    const EVENT_EXCHANGE = 'events';

    await this.messageBroker.assertExchange(EVENT_EXCHANGE, 'topic');
    await this.messageBroker.assertQueue(this.queueName);

    logger.info('Event consumer initialized', {
      queueName: this.queueName,
    });
  }

  /**
   * Subscribe to event type
   */
  subscribe<T extends DomainEvent>(
    eventType: EventType,
    handler: EventHandler<T>
  ): void {
    const subscriptionKey = eventType;
    this.subscriptions.set(subscriptionKey, { eventType, handler });

    logger.info('Subscribed to event', {
      eventType,
      queueName: this.queueName,
    });
  }

  /**
   * Start consuming events
   */
  async startConsuming(): Promise<void> {
    const EVENT_EXCHANGE = 'events';

    if (this.subscriptions.size === 0) {
      logger.warn('No subscriptions registered for event consumer');
      return;
    }

    // Bind queue to all subscribed event types
    for (const subscription of this.subscriptions.values()) {
      const routingKey = this.getRoutingKey(subscription.eventType);
      await this.messageBroker.bindQueue(
        this.queueName,
        EVENT_EXCHANGE,
        routingKey
      );
    }

    // Start consuming
    await this.messageBroker.consume(
      this.queueName,
      this.handleMessage.bind(this),
      { prefetch: 1 }
    );

    logger.info('Event consumer started consuming messages', {
      queueName: this.queueName,
      subscriptions: this.subscriptions.size,
    });
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(msg: ConsumeMessage): Promise<void> {
    try {
      const envelope = JSON.parse(msg.content.toString()) as MessageEnvelope<DomainEvent>;

      logger.info('Received event message', {
        eventType: envelope.type,
        messageId: envelope.id,
        correlationId: envelope.correlationId,
      });

      const subscription = this.subscriptions.get(envelope.type);
      if (!subscription) {
        logger.warn('No handler for event type', {
          eventType: envelope.type,
        });
        return;
      }

      await subscription.handler(envelope.payload, envelope);

      logger.info('Event processed successfully', {
        eventType: envelope.type,
        messageId: envelope.id,
      });
    } catch (error) {
      logger.error('Error handling event message', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get routing key for event type
   */
  private getRoutingKey(eventType: EventType): string {
    const parts = eventType.split('.');
    return parts.join('.');
  }
}
