# ADR-004: RabbitMQ Exchange Topology and Message Routing

## Status

Accepted

## Context

SwiftTrack needs a well-designed message routing topology in RabbitMQ to handle different types of events and ensure proper message delivery, failure handling, and scalability. The system must support domain events, integration events, and real-time notifications.

## Decision

We will implement a **multi-exchange topology** with topic-based routing for domain events, fanout for real-time updates, and direct routing for point-to-point communication.

## Rationale

### Exchange Design Principles

1. **Separation of Concerns**: Different exchanges for different message types
2. **Scalability**: Topic routing allows fine-grained subscription control
3. **Fault Tolerance**: Dead letter exchanges for failed message handling
4. **Flexibility**: Easy to add new consumers without affecting existing ones
5. **Monitoring**: Clear message flow for observability

## Exchange Topology

### Primary Exchanges

#### 1. Orders Exchange (Topic)

```
Name: orders.exchange
Type: topic
Durable: true
Routing Keys:
  - order.created
  - order.updated
  - order.status.changed
  - order.assigned
  - order.delivered
  - order.failed
  - order.confirmed
```

#### 2. Tracking Exchange (Fanout)

```
Name: tracking.exchange
Type: fanout
Durable: true
Purpose: Real-time location updates
Consumers: WebSocket gateway, analytics service
```

#### 3. Integration Exchange (Topic)

```
Name: integration.exchange
Type: topic
Durable: true
Routing Keys:
  - cms.client.created
  - cms.order.created
  - cms.order.updated
  - ros.route.optimized
  - ros.route.failed
  - wms.inventory.arrived
  - wms.inventory.picked
  - wms.inventory.departed
```

#### 4. Notifications Exchange (Topic)

```
Name: notifications.exchange
Type: topic
Durable: true
Routing Keys:
  - notification.push
  - notification.email
  - notification.sms
  - notification.websocket
```

#### 5. Dead Letter Exchange (Direct)

```
Name: dlx.exchange
Type: direct
Durable: true
Purpose: Failed message handling
```

### Queue Design

#### Domain Event Queues

```
orders.created.queue
  └── Bound to: orders.exchange (order.created)
  └── Consumers: Integration services, notification service

orders.status.queue
  └── Bound to: orders.exchange (order.*)
  └── Consumers: Client notification, analytics

orders.delivery.queue
  └── Bound to: orders.exchange (order.delivered, order.confirmed)
  └── Consumers: Billing service, analytics
```

#### Integration Queues

```
integration.cms.queue
  └── Bound to: integration.exchange (cms.*)
  └── Consumer: CMS integration service

integration.ros.queue
  └── Bound to: integration.exchange (ros.*)
  └── Consumer: ROS integration service

integration.wms.queue
  └── Bound to: integration.exchange (wms.*)
  └── Consumer: WMS integration service
```

#### Real-time Queues

```
tracking.websocket.queue
  └── Bound to: tracking.exchange
  └── Consumer: WebSocket gateway

tracking.analytics.queue
  └── Bound to: tracking.exchange
  └── Consumer: Analytics service
```

#### Dead Letter Queues

```
orders.created.dlq
orders.status.dlq
integration.cms.dlq
integration.ros.dlq
integration.wms.dlq
tracking.updates.dlq
```

## Message Format Standards

### Event Structure

```typescript
interface DomainEvent {
  eventId: string; // UUID
  eventType: string; // order.created
  aggregateId: string; // Order ID
  aggregateType: string; // Order
  version: number; // Event version
  timestamp: string; // ISO 8601
  data: any; // Event payload
  metadata: {
    correlationId: string; // Request correlation
    causationId?: string; // Causing event ID
    userId?: string; // Acting user
    source: string; // Service name
  };
}
```

### Message Properties

```typescript
// RabbitMQ message properties
{
  messageId: string;         // Unique message ID
  timestamp: number;         // Unix timestamp
  correlationId: string;     // Request correlation
  replyTo?: string;          // Response queue
  expiration?: string;       // TTL in milliseconds
  persistent: true;          // Message durability
  contentType: 'application/json';
  contentEncoding: 'utf-8';
}
```

## Routing Strategies

### Order Events

```typescript
// Fine-grained routing for order events
'order.created' → All integration services + notifications
'order.status.placed' → CMS integration only
'order.status.in_transit' → Client notifications + tracking
'order.status.delivered' → Driver app + billing
'order.status.confirmed' → Analytics + reporting
```

### Integration Events

```typescript
// Service-specific routing
'cms.*' → CMS integration service
'ros.route.*' → Route optimization handlers
'wms.inventory.*' → Warehouse management handlers
```

### Geographic Routing (Future)

```typescript
// Region-based routing for scaling
'order.created.region.lk-western';
'order.created.region.lk-central';
'tracking.update.region.lk-western';
```

## Quality of Service Settings

### Queue Configuration

```typescript
// Standard queue settings
{
  durable: true,              // Survive broker restarts
  exclusive: false,           // Shared queues
  autoDelete: false,          // Manual queue management
  arguments: {
    'x-message-ttl': 86400000,        // 24 hours
    'x-max-length': 10000,            // Queue size limit
    'x-dead-letter-exchange': 'dlx.exchange',
    'x-dead-letter-routing-key': 'queue-name.dlq'
  }
}
```

### Consumer Configuration

```typescript
// Consumer settings
{
  prefetchCount: 10,          // QoS prefetch
  noAck: false,              // Explicit acknowledgments
  exclusive: false,           // Multiple consumers
  arguments: {
    'x-priority': 5           // Consumer priority
  }
}
```

## Error Handling Strategy

### Retry Logic

1. **Transient Errors**: 3 retries with exponential backoff
2. **Message Rejection**: Send to DLQ after max retries
3. **Poison Messages**: Immediate DLQ for malformed messages
4. **Circuit Breaker**: Stop consuming when downstream is down

### Dead Letter Processing

```typescript
// DLQ message format
interface DeadLetterMessage {
  originalMessage: any;
  failureReason: string;
  failureCount: number;
  firstFailureTime: string;
  lastFailureTime: string;
  originalQueue: string;
  originalExchange: string;
  originalRoutingKey: string;
}
```

## Monitoring and Alerting

### Key Metrics

- Message rates per exchange/queue
- Consumer lag and processing time
- Dead letter queue depth
- Connection and channel count
- Memory and disk usage

### Alerting Thresholds

- DLQ depth > 100 messages
- Consumer lag > 5 minutes
- Message rate drop > 50%
- Error rate > 5%

## Consequences

### Positive

- **Scalability**: Easy to add new consumers
- **Fault Tolerance**: Comprehensive error handling
- **Flexibility**: Fine-grained message routing
- **Observability**: Clear message flow tracking
- **Performance**: Optimized for different message types

### Negative

- **Complexity**: More exchanges and queues to manage
- **Operational Overhead**: More monitoring required
- **Resource Usage**: Higher memory usage for multiple queues

### Operational Considerations

- **Monitoring**: RabbitMQ management plugin + custom dashboards
- **Backup**: Regular configuration and message backups
- **Scaling**: Cluster setup for high availability
- **Maintenance**: Queue cleanup and message archival

## Migration Strategy

### Phase 1: Basic Setup

- Create primary exchanges and queues
- Implement basic producers and consumers
- Set up monitoring and alerting

### Phase 2: Advanced Features

- Add geographic routing
- Implement priority queues
- Advanced error handling

### Phase 3: Optimization

- Performance tuning
- Advanced routing patterns
- Cross-region replication

## Review Date

This decision will be reviewed in 6 months or when message volume exceeds 1M messages/day.
