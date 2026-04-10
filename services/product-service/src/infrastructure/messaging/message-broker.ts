import amqplib from 'amqplib';

export interface MessageBrokerConfig {
  url: string;
  exchange?: string;
  exchangeType?: string;
}

/**
 * Thin wrapper around amqplib for RabbitMQ.
 * Compatible with amqplib v1.x (connect returns ChannelModel).
 */
export class MessageBroker {
  // amqplib v1.x: connect() → ChannelModel which also acts as a channel factory
  private model: Awaited<ReturnType<typeof amqplib.connect>> | null = null;
  private channel: amqplib.Channel | null = null;
  private readonly exchange: string;
  private readonly exchangeType: string;

  constructor(private readonly config: MessageBrokerConfig) {
    this.exchange = config.exchange ?? 'events';
    this.exchangeType = config.exchangeType ?? 'topic';
  }

  async connect(): Promise<void> {
    this.model = await amqplib.connect(this.config.url);
    this.channel = await this.model.createChannel();
    await this.channel.assertExchange(this.exchange, this.exchangeType, { durable: true });
  }

  async publish(routingKey: string, message: object): Promise<boolean> {
    if (!this.channel) throw new Error('MessageBroker not connected');
    const buffer = Buffer.from(JSON.stringify(message));
    return this.channel.publish(this.exchange, routingKey, buffer, {
      persistent: true,
      contentType: 'application/json',
    });
  }

  async subscribe(
    queue: string,
    routingKey: string,
    handler: (msg: object) => Promise<void>
  ): Promise<void> {
    if (!this.channel) throw new Error('MessageBroker not connected');
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, this.exchange, routingKey);
    const ch = this.channel;
    ch.consume(queue, async (raw) => {
      if (!raw) return;
      try {
        const payload = JSON.parse(raw.content.toString()) as object;
        await handler(payload);
        ch.ack(raw);
      } catch {
        ch.nack(raw, false, false);
      }
    });
  }

  async disconnect(): Promise<void> {
    try { await this.channel?.close(); } catch { /* ignore */ }
    try { await this.model?.close(); } catch { /* ignore */ }
    this.channel = null;
    this.model = null;
  }
}
