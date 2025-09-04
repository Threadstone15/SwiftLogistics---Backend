import { MessageBus, ExchangeType } from './interfaces/message-bus.interface';

export class MessageBusFactory {
  static create(type: 'rabbitmq' | 'kafka', connectionString: string): MessageBus {
    switch (type) {
      case 'rabbitmq':
        // Dynamic import to avoid loading RabbitMQ when using Kafka
        const { RabbitMQMessageBus } = require('./implementations/rabbitmq.message-bus');
        return new RabbitMQMessageBus(connectionString);
      case 'kafka':
        throw new Error('Kafka implementation not yet available');
      default:
        throw new Error(`Unknown message bus type: ${type}`);
    }
  }

  static async setupExchangesAndQueues(messageBus: MessageBus): Promise<void> {
    // Create exchanges
    await messageBus.createExchange('orders.exchange', ExchangeType.TOPIC);
    await messageBus.createExchange('tracking.exchange', ExchangeType.FANOUT);
    await messageBus.createExchange('integration.exchange', ExchangeType.TOPIC);
    await messageBus.createExchange('dlx.exchange', ExchangeType.DIRECT);

    // Create queues
    await messageBus.createQueue('orders.created', {
      durable: true,
      deadLetterExchange: 'dlx.exchange',
      deadLetterRoutingKey: 'orders.created.dlq',
    });
    
    await messageBus.createQueue('orders.updated', {
      durable: true,
      deadLetterExchange: 'dlx.exchange',
      deadLetterRoutingKey: 'orders.updated.dlq',
    });

    await messageBus.createQueue('tracking.updates', {
      durable: true,
      deadLetterExchange: 'dlx.exchange',
      deadLetterRoutingKey: 'tracking.updates.dlq',
    });

    await messageBus.createQueue('integration.cms', {
      durable: true,
      deadLetterExchange: 'dlx.exchange',
      deadLetterRoutingKey: 'integration.cms.dlq',
    });

    await messageBus.createQueue('integration.ros', {
      durable: true,
      deadLetterExchange: 'dlx.exchange',
      deadLetterRoutingKey: 'integration.ros.dlq',
    });

    await messageBus.createQueue('integration.wms', {
      durable: true,
      deadLetterExchange: 'dlx.exchange',
      deadLetterRoutingKey: 'integration.wms.dlq',
    });

    // Dead letter queues
    await messageBus.createQueue('orders.created.dlq', { durable: true });
    await messageBus.createQueue('orders.updated.dlq', { durable: true });
    await messageBus.createQueue('tracking.updates.dlq', { durable: true });
    await messageBus.createQueue('integration.cms.dlq', { durable: true });
    await messageBus.createQueue('integration.ros.dlq', { durable: true });
    await messageBus.createQueue('integration.wms.dlq', { durable: true });

    // Bind queues to exchanges
    await messageBus.bindQueue('orders.created', 'orders.exchange', 'order.created');
    await messageBus.bindQueue('orders.updated', 'orders.exchange', 'order.*');
    await messageBus.bindQueue('tracking.updates', 'tracking.exchange', '');
    await messageBus.bindQueue('integration.cms', 'integration.exchange', 'cms.*');
    await messageBus.bindQueue('integration.ros', 'integration.exchange', 'ros.*');
    await messageBus.bindQueue('integration.wms', 'integration.exchange', 'wms.*');

    // Bind dead letter queues
    await messageBus.bindQueue('orders.created.dlq', 'dlx.exchange', 'orders.created.dlq');
    await messageBus.bindQueue('orders.updated.dlq', 'dlx.exchange', 'orders.updated.dlq');
    await messageBus.bindQueue('tracking.updates.dlq', 'dlx.exchange', 'tracking.updates.dlq');
    await messageBus.bindQueue('integration.cms.dlq', 'dlx.exchange', 'integration.cms.dlq');
    await messageBus.bindQueue('integration.ros.dlq', 'dlx.exchange', 'integration.ros.dlq');
    await messageBus.bindQueue('integration.wms.dlq', 'dlx.exchange', 'integration.wms.dlq');
  }
}
