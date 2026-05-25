/**
 * RabbitMQ Client Configuration
 * Manages connection and channel creation
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import amqp from 'amqplib';
import { logger } from '../../shared/logger';

export interface BrokerConfig {
  url: string;
  reconnectDelay: number;
  maxRetries: number;
}

export class MessageBroker {
  private connection: any = null;
  private channel: any = null;
  private config: BrokerConfig;
  private retryCount = 0;

  constructor(config: BrokerConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.config.url);
      this.channel = await this.connection.createChannel();
      logger.info('Connected to message broker');
      this.connection.on('error', this.handleConnectionError.bind(this));
      this.connection.on('close', this.handleClose.bind(this));
    } catch (error) {
      logger.error(
        { error: error instanceof Error ? error.message : String(error), attempt: this.retryCount + 1 },
        'Failed to connect to message broker'
      );
      if (this.retryCount < this.config.maxRetries) {
        this.retryCount++;
        await new Promise((resolve) => setTimeout(resolve, this.config.reconnectDelay));
        return this.connect();
      }
      throw new Error('Failed to connect to message broker after max retries');
    }
  }

  async getChannel(): Promise<any> {
    if (!this.channel) throw new Error('Message broker not connected');
    return this.channel;
  }

  async assertExchange(exchange: string, type: 'fanout' | 'direct' | 'topic', options?: any): Promise<void> {
    const channel = await this.getChannel();
    await channel.assertExchange(exchange, type, { durable: true, ...options });
  }

  async assertQueue(queue: string, options?: any): Promise<void> {
    const channel = await this.getChannel();
    await channel.assertQueue(queue, { durable: true, ...options });
  }

  async bindQueue(queue: string, exchange: string, pattern: string): Promise<void> {
    const channel = await this.getChannel();
    await channel.bindQueue(queue, exchange, pattern);
  }

  async publish(exchange: string, routingKey: string, message: Buffer, options?: any): Promise<boolean> {
    const channel = await this.getChannel();
    return channel.publish(exchange, routingKey, message, {
      contentType: 'application/json',
      persistent: true,
      ...options,
    });
  }

  async consume(queue: string, onMessage: (msg: any) => Promise<void>, options?: any): Promise<void> {
    const channel = await this.getChannel();
    await channel.consume(
      queue,
      async (msg: any) => {
        if (!msg) return;
        try {
          await onMessage(msg);
          channel.ack(msg);
        } catch (error) {
          logger.error(
            { error: error instanceof Error ? error.message : String(error) },
            'Error processing message'
          );
          channel.nack(msg, false, true);
        }
      },
      { noAck: false, ...options }
    );
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      logger.info('Disconnected from message broker');
    } catch (error) {
      logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        'Error closing broker connection'
      );
    }
  }

  private handleConnectionError(error: Error): void {
    logger.error({ error: error.message }, 'Message broker connection error');
  }

  private handleClose(): void {
    logger.warn('Message broker connection closed');
  }
}
