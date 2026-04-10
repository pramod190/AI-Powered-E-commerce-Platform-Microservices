import type { DomainEvent, MessageEnvelope } from './events';
import type { MessageBroker } from './message-broker';

export type EventHandler<T extends DomainEvent> = (envelope: MessageEnvelope<T>) => Promise<void>;

/**
 * Subscribes to one or more routing keys and dispatches incoming
 * MessageEnvelopes to registered handlers.
 */
export class EventConsumer {
  constructor(private readonly broker: MessageBroker) {}

  /**
   * @param queue       Durable RabbitMQ queue name (unique per service).
   * @param routingKey  AMQP topic routing key (supports wildcards: *.#).
   * @param handler     Called for every successfully parsed envelope.
   */
  async subscribe<T extends DomainEvent>(
    queue: string,
    routingKey: string,
    handler: EventHandler<T>
  ): Promise<void> {
    await this.broker.subscribe(queue, routingKey, async (raw) => {
      const envelope = raw as MessageEnvelope<T>;
      await handler(envelope);
    });
  }
}
