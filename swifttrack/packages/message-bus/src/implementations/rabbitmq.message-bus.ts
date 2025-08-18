import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { MessageBus, MessageHandler, ExchangeType, QueueOptions } from '../interfaces/message-bus.interface';

export class RabbitMQMessageBus implements MessageBus {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly url: string;
  private readonly reconnectInterval = 5000;
  private isReconnecting = false;

  constructor(url: string) {
    this.url = url;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      // Set up error handlers
      this.connection.on('error', this.handleConnectionError.bind(this));
      this.connection.on('close', this.handleConnectionClose.bind(this));
      this.channel.on('error', this.handleChannelError.bind(this));

      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      console.log('Disconnected from RabbitMQ');
    } catch (error) {
      console.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  async publish(exchange: string, routingKey: string, message: any): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not available');
    }

    const messageBuffer = Buffer.from(JSON.stringify(message));
    const published = this.channel.publish(exchange, routingKey, messageBuffer, {
      persistent: true,
      timestamp: Date.now(),
      messageId: this.generateMessageId(),
    });

    if (!published) {
      throw new Error('Failed to publish message');
    }
  }

  async subscribe(queue: string, handler: MessageHandler): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not available');
    }

    await this.channel.consume(queue, async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        await handler(
          content,
          () => this.channel!.ack(msg),
          () => this.channel!.nack(msg, false, false)
        );
      } catch (error) {
        console.error('Error processing message:', error);
        this.channel!.nack(msg, false, false);
      }
    });
  }

  async createExchange(name: string, type: ExchangeType): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not available');
    }

    await this.channel.assertExchange(name, type, { durable: true });
  }

  async createQueue(name: string, options: QueueOptions = {}): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not available');
    }

    const queueOptions: any = {
      durable: options.durable ?? true,
      exclusive: options.exclusive ?? false,
      autoDelete: options.autoDelete ?? false,
    };

    if (options.deadLetterExchange) {
      queueOptions.arguments = {
        'x-dead-letter-exchange': options.deadLetterExchange,
      };
      if (options.deadLetterRoutingKey) {
        queueOptions.arguments['x-dead-letter-routing-key'] = options.deadLetterRoutingKey;
      }
    }

    if (options.messageTtl) {
      queueOptions.arguments = queueOptions.arguments || {};
      queueOptions.arguments['x-message-ttl'] = options.messageTtl;
    }

    if (options.maxLength) {
      queueOptions.arguments = queueOptions.arguments || {};
      queueOptions.arguments['x-max-length'] = options.maxLength;
    }

    await this.channel.assertQueue(name, queueOptions);
  }

  async bindQueue(queue: string, exchange: string, routingKey: string): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not available');
    }

    await this.channel.bindQueue(queue, exchange, routingKey);
  }

  private async handleConnectionError(error: Error): Promise<void> {
    console.error('RabbitMQ connection error:', error);
    await this.reconnect();
  }

  private async handleConnectionClose(): Promise<void> {
    console.warn('RabbitMQ connection closed');
    await this.reconnect();
  }

  private handleChannelError(error: Error): void {
    console.error('RabbitMQ channel error:', error);
  }

  private async reconnect(): Promise<void> {
    if (this.isReconnecting) return;
    
    this.isReconnecting = true;
    console.log('Attempting to reconnect to RabbitMQ...');

    try {
      await this.disconnect();
      await new Promise(resolve => setTimeout(resolve, this.reconnectInterval));
      await this.connect();
      this.isReconnecting = false;
      console.log('Reconnected to RabbitMQ');
    } catch (error) {
      console.error('Failed to reconnect to RabbitMQ:', error);
      this.isReconnecting = false;
      // Try again after interval
      setTimeout(() => this.reconnect(), this.reconnectInterval);
    }
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
