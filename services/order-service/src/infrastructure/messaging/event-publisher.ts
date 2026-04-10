/**
 * Event Publisher
 * Publishes domain events to message broker
 */

import { v4 as uuidv4 } from 'uuid';
import { MessageBroker } from './message-broker';
import { DomainEvent, MessageEnvelope, EventType } from './events';
import { logger } from '../../shared/logger';

const EVENT_EXCHANGE = 'events';

export class EventPublisher {
  constructor(private messageBroker: MessageBroker) {}

  /**
   * Initialize event publisher
   */
  async initialize(): Promise<void> {
    await this.messageBroker.assertExchange(EVENT_EXCHANGE, 'topic');
    logger.info('Event publisher initialized');
  }

  /**
   * Publish domain event
   */
  async publish<T extends DomainEvent>(
    event: T,
    correlationId: string
  ): Promise<void> {
    try {
      const envelope: MessageEnvelope<T> = {
        id: uuidv4(),
        type: event.type,
        timestamp: Date.now(),
        correlationId,
        version: '1.0',
        payload: event,
      };

      const message = Buffer.from(JSON.stringify(envelope));
      const routingKey = this.getRoutingKey(event.type);

      const success = await this.messageBroker.publish(
        EVENT_EXCHANGE,
        routingKey,
        message
      );

      if (success) {
        logger.info('Event published', {
          eventType: event.type,
          correlationId,
          messageId: envelope.id,
        });
      } else {
        logger.warn('Message buffer full, event may be dropped', {
          eventType: event.type,
        });
      }
    } catch (error) {
      logger.error('Failed to publish event', {
        eventType: event.type,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get routing key for event type
   * Supports topic-based routing
   */
  private getRoutingKey(eventType: EventType): string {
    const parts = eventType.split('.');
    return parts.join('.');
  }
}
