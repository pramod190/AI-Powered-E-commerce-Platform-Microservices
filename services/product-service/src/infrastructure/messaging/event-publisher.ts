import type { DomainEvent, MessageEnvelope } from './events';
import type { MessageBroker } from './message-broker';
import { randomUUID } from 'node:crypto';

/**
 * Wraps a DomainEvent in a MessageEnvelope and publishes it
 * via the underlying MessageBroker.
 */
export class EventPublisher {
  constructor(private readonly broker: MessageBroker) {}

  async publish<T extends DomainEvent>(
    event: T,
    routingKey?: string
  ): Promise<boolean> {
    const envelope: MessageEnvelope<T> = {
      id: randomUUID(),
      type: event.type,
      timestamp: event.timestamp,
      correlationId: event.correlationId,
      version: '1',
      payload: event,
    };

    const key = routingKey ?? event.type;
    return this.broker.publish(key, envelope);
  }
}
