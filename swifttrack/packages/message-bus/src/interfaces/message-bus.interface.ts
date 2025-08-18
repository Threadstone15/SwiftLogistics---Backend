export interface MessageBus {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish(exchange: string, routingKey: string, message: any): Promise<void>;
  subscribe(queue: string, handler: MessageHandler): Promise<void>;
  createExchange(name: string, type: ExchangeType): Promise<void>;
  createQueue(name: string, options?: QueueOptions): Promise<void>;
  bindQueue(queue: string, exchange: string, routingKey: string): Promise<void>;
}

export type MessageHandler = (message: any, ack: () => void, nack: () => void) => Promise<void>;

export enum ExchangeType {
  DIRECT = 'direct',
  TOPIC = 'topic',
  FANOUT = 'fanout',
  HEADERS = 'headers',
}

export interface QueueOptions {
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  deadLetterExchange?: string;
  deadLetterRoutingKey?: string;
  messageTtl?: number;
  maxLength?: number;
}
