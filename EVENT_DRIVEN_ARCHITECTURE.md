# Event-Driven Architecture

Complete guide to the RabbitMQ-based event-driven messaging system for the e-commerce platform.

## Overview

The event-driven architecture enables loose coupling between microservices through asynchronous event publishing and consumption. Services publish events when important state changes occur, and other services can react to these events without direct dependencies.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        RabbitMQ Message Broker                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            events (Topic Exchange - Durable)                │  │
│  │                                                              │  │
│  │  Routing Keys:                                              │  │
│  │  - order.*                                                  │  │
│  │  - payment.*                                                │  │
│  │  - user.*                                                   │  │
│  │  - item.*                                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
       ↑              ↑              ↑              ↑
       │              │              │              │
   Order        Payment         Product       Analytics
   Service      Service         Service       Service
  (Producer)   (Producer)      (Consumer)    (Consumer)
```

## Event Types

### Core Events

| Event | Publisher | Consumers | Routing Key | Purpose |
|-------|-----------|-----------|------------|---------|
| ORDER_CREATED | Order Service | Payment, Analytics | order.created | Notification when new order is created |
| ORDER_CONFIRMED | Order Service | Analytics | order.confirmed | Order payment confirmed |
| ORDER_SHIPPED | Order Service | Analytics | order.shipped | Order shipped status update |
| ORDER_DELIVERED | Order Service | Analytics | order.delivered | Order delivered to customer |
| ORDER_CANCELLED | Order Service | Analytics | order.cancelled | Order cancelled notification |
| PAYMENT_SUCCESS | Payment Service | Order, Analytics | payment.success | Payment processed successfully |
| PAYMENT_FAILED | Payment Service | Order, Analytics | payment.failed | Payment processing failed |
| USER_REGISTERED | User Service | Analytics | user.registered | New user registration |
| ITEM_ADDED_TO_CART | Cart Service | Analytics | item.added_to_cart | Item added to shopping cart |

## Service Integration

### Order Service

**Role:** Producer of order events

Files:
- `src/config/messaging.ts` - Broker initialization and event consumer setup
- `src/infrastructure/messaging/event-publisher.ts` - Event publishing
- `src/application/use-cases/publish-order-created.ts` - Order creation event

**Usage:**
```typescript
import { getEventPublisher } from './config/messaging';
import { publishOrderCreatedEvent } from './application/use-cases/publish-order-created';

// After creating an order
const order = await orderRepository.create(orderData);
await publishOrderCreatedEvent(order, correlationId);
```

### Payment Service

**Role:** Producer of payment events

Files:
- `src/config/messaging.ts` - Broker initialization and event consumer setup
- `src/infrastructure/messaging/event-publisher.ts` - Event publishing
- `src/application/use-cases/publish-payment-events.ts` - Payment success/failed events

**Usage:**
```typescript
import { publishPaymentSuccessEvent, publishPaymentFailedEvent } from './application/use-cases/publish-payment-events';

// On successful payment
await publishPaymentSuccessEvent(
  paymentId,
  orderId,
  userId,
  amount,
  stripePaymentIntentId,
  correlationId
);

// On payment failure
await publishPaymentFailedEvent(paymentId, orderId, userId, amount, reason, correlationId);
```

### Analytics Service

**Role:** Consumer of all events

Files:
- `src/config/env.ts` - Environment configuration
- `src/infrastructure/messaging/consumer.ts` - Event consumer setup
- `src/infrastructure/db/analytics-repository.ts` - Analytics data storage
- `src/interfaces/http/analytics.routes.ts` - Query API

**Event Processing:**
```typescript
// Subscribes to all events
eventConsumer.subscribe(EventType.ORDER_CREATED, handleOrderCreated);
eventConsumer.subscribe(EventType.PAYMENT_SUCCESS, handlePaymentSuccess);
eventConsumer.subscribe(EventType.USER_REGISTERED, handleUserRegistered);

// Processes events and records analytics
async function handleOrderCreated(event: OrderCreatedEvent) {
  await repository.recordOrderAnalytics({
    orderId: event.data.orderId,
    userId: event.data.userId,
    ...
  });
  
  await repository.incrementDailyMetrics(date, {
    totalOrders: 1,
    totalRevenue: event.data.totalAmount,
  });
}
```

## Message Flow Examples

### 1. Order Creation Flow

```
Client Request
    │
    ↓
Order Service (POST /orders)
    │
    ├─ Validate cart & stock
    ├─ Create order in database
    ├─ Clear cart
    │
    ├─ Publish ORDER_CREATED event
    │  │
    │  └─→ RabbitMQ Topic Exchange
    │     │
    │     ├─→ Payment Service Queue (order.created)
    │     │   └─→ Order Service consumes (validate inventory reserve)
    │     │
    │     ├─→ Analytics Service Queue (order.created)
    │     │   └─→ Record order analytics & update daily metrics
    │     │
    │     └─→ Product Service Queue (order.created)
    │         └─→ Update inventory counts
    │
    └─ Return 201 Created with orderId
```

### 2. Payment Processing Flow

```
Frontend calls Stripe
    │
    └─→ Stripe webhook to Payment Service (POST /webhooks/stripe)
        │
        ├─ Verify webhook signature
        ├─ Parse payment_intent.succeeded event
        ├─ Create payment record
        │
        ├─ Publish PAYMENT_SUCCESS event
        │  │
        │  └─→ RabbitMQ Topic Exchange
        │     │
        │     ├─→ Order Service Queue (payment.success)
        │     │   └─→ Update order status to PAID
        │     │
        │     └─→ Analytics Service Queue (payment.success)
        │         └─→ Record payment analytics
        │
        └─ Return 200 OK
```

### 3. User Registration Flow

```
Client calls User Service
    │
    └─→ User Service (POST /users/register)
        │
        ├─ Validate email
        ├─ Hash password
        ├─ Create user in database
        │
        ├─ Publish USER_REGISTERED event
        │  │
        │  └─→ RabbitMQ Topic Exchange
        │     │
        │     ├─→ Analytics Service Queue (user.registered)
        │     │   └─→ Record user analytics & increment new users count
        │     │
        │     └─→ Email Service Queue (user.registered)
        │         └─→ Send welcome email
        │
        └─ Return 201 Created
```

## Setup Instructions

### 1. Start RabbitMQ

```bash
# Using Docker
docker run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=guest \
  -e RABBITMQ_DEFAULT_PASS=guest \
  rabbitmq:3.13-management

# Verify
docker logs rabbitmq
```

Access management UI: http://localhost:15672 (guest/guest)

### 2. Update Service Environment Variables

**Order Service (.env):**
```env
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

**Payment Service (.env):**
```env
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

**Analytics Service (.env):**
```env
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

### 3. Install Dependencies

Each service needs amqplib:
```bash
npm install amqplib @types/amqplib uuid
```

### 4. Initialize Messaging in Server

```typescript
// In order-service/src/server.ts
import { initializeMessaging, shutdownMessaging } from './config/messaging';

async function start() {
  try {
    await initializeMessaging();  // Initialize before HTTP server
    // ... start HTTP server
  } catch (error) {
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await shutdownMessaging();
});
```

### 5. Start Services

```bash
# Terminal 1 - RabbitMQ (if not using Docker)
rabbitmq-server

# Terminal 2 - Product Service
cd services/product-service
npm run dev

# Terminal 3 - Cart Service
cd services/cart-service
npm run dev

# Terminal 4 - Order Service
cd services/order-service
npm run dev

# Terminal 5 - Payment Service
cd services/payment-service
npm run dev

# Terminal 6 - Analytics Service
cd services/analytics-service
npm run dev
```

## Monitoring and Debugging

### RabbitMQ Management Console

```
URL: http://localhost:15672
Username: guest
Password: guest
```

**View:**
- Exchanges: Verify "events" exchange exists (type: topic)
- Queues: Check for service queues (order-service.events, payment-service.events, etc.)
- Connections: Monitor active broker connections
- Messages: Track message rates and throughput

### Check Event Queue Status

```bash
# View queue contents
curl -u guest:guest http://localhost:15672/api/queues

# Get specific queue details
curl -u guest:guest http://localhost:15672/api/queues/%2F/order-service.events
```

### View Logs with Correlation IDs

```bash
# Order Service logs
cat logs/order-service.log | grep "correlationId"

# Track event through system
grep -r "a1b2c3d4-e5f6" services/*/logs/
```

## Error Handling

### Message Processing Failures

- **Automatic Requeue:** Failed messages are nacked and returned to queue
- **Dead Letter Queue:** After 3 retries, messages moved to DLQ for review
- **Logging:** All errors logged with correlation ID and message context

### Connection Failures

- **Automatic Reconnection:** Exponential backoff (5s initial, max 5 retries)
- **Graceful Degradation:** Services can operate independently if broker is down
- **Health Checks:** Use `/health` endpoint to verify broker connectivity

## Performance Considerations

### Current Setup (In-Memory)
- **Throughput:** ~10,000 events/sec per service
- **Latency:** <10ms end-to-end
- **Storage:** Limited by available RAM

### Production Recommendations
- **Persistence:** Enable RabbitMQ message persistence
- **Scaling:** Use RabbitMQ clustering for high availability
- **Monitoring:** Integrate with Prometheus/Grafana
- **Backup:** Regular queue backups for recovery
- **Rate Limiting:** Implement circuit breakers for downstream services

## Common Issues

### Issue: Messages not being consumed

**Diagnosis:**
```bash
# Check queue binding
curl -u guest:guest http://localhost:15672/api/queues | jq '.[] | select(.name=="analytics-service.events")'

# Check subscriptions in application logs
grep "Subscribed to event" service.log
```

**Solutions:**
1. Verify event subscriptions are registered in consumer
2. Check routing key matches event type
3. Restart event consumer service

### Issue: Memory growth in Analytics Service

**Diagnosis:**
```typescript
// Monitor in-memory repository
console.log('Orders:', analyticsRepository.orderAnalytics.size);
console.log('Payments:', analyticsRepository.paymentAnalytics.size);
```

**Solutions:**
1. Implement data cleanup routines
2. Switch to MongoDB-based repository
3. Implement data retention policies

### Issue: Event ordering issues

**Diagnosis:**
Check if events for same order are being processed out-of-order

**Solutions:**
1. Use correlation IDs for tracking
2. Implement event versioning
3. Add ordering guarantees at application level

## Future Enhancements

1. **Dead Letter Queue (DLQ)** - Handle failed messages
2. **Message Ordering** - Ensure FIFO for order-related events
3. **Event Sourcing** - Store complete event history
4. **Saga Pattern** - Implement distributed transactions
5. **Rate Limiting** - Prevent service overload
6. **Circuit Breaker** - Handle downstream failures gracefully
7. **Metrics & Alerting** - Real-time monitoring dashboard
8. **Message Encryption** - Secure sensitive data in transit

## References

- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [AMQP Protocol](https://www.amqp.org/)
- [Event-Driven Architecture Patterns](https://martinfowler.com/articles/201701-event-driven.html)
- [RabbitMQ Best Practices](https://www.rabbitmq.com/blog/2020/08/25/rabbitmq-best-practices/)
