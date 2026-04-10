# Analytics Service

A real-time analytics service that processes events from across the e-commerce platform and generates insights on orders, payments, and user activity.

**Port:** 4006

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Analytics Service (4006)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Orders     │  │  Payments    │  │    Users     │       │
│  │  Analytics   │  │  Analytics   │  │  Analytics   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         ↑                ↑                    ↑               │
│  ┌──────────────────────────────────────────────────┐       │
│  │        Event Consumer (RabbitMQ)                 │       │
│  │                                                  │       │
│  │  - ORDER_CREATED                                │       │
│  │  - PAYMENT_SUCCESS / PAYMENT_FAILED             │       │
│  │  - USER_REGISTERED                              │       │
│  └──────────────────────────────────────────────────┘       │
│                       ↑                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │          In-Memory Repository (Dev)                │    │
│  │                                                    │    │
│  │  - Order Analytics (Map)                          │    │
│  │  - Payment Analytics (Map)                        │    │
│  │  - User Analytics (Map)                           │    │
│  │  - Daily Metrics (Map)                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────────────────────┐                           │
│  │  HTTP API (Express)          │                           │
│  │                              │                           │
│  │  GET /health                 │                           │
│  │  GET /analytics/metrics/...  │                           │
│  └──────────────────────────────┘                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ↑                                    ↑
         │                                    │
  RabbitMQ Events                   Event Queries/HTTP
  (from other services)             (from frontend/admin)
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

**Key Dependencies:**
- `amqplib` - RabbitMQ client for event consumption
- `express` - HTTP server
- `pino` - Structured logging
- `zod` - Environment validation

### 2. Environment Variables

Create `.env` file:

```env
RABBITMQ_URL=amqp://guest:guest@localhost:5672
NODE_ENV=development
PORT=4006
LOG_LEVEL=info
MONGODB_URI=mongodb://localhost:27017/analytics

# Service URLs
PRODUCT_SERVICE_URL=http://localhost:4002
CART_SERVICE_URL=http://localhost:4003
ORDER_SERVICE_URL=http://localhost:4004
PAYMENT_SERVICE_URL=http://localhost:4005
```

### 3. Start RabbitMQ

```bash
# Using Docker
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=guest \
  -e RABBITMQ_DEFAULT_PASS=guest \
  rabbitmq:3.13-management
```

RabbitMQ Management UI: http://localhost:15672 (guest/guest)

### 4. Start Analytics Service

```bash
npm run dev
```

Service available at: http://localhost:4006

## Event Types

### ORDER_CREATED
Fired when order is created in Order Service

```json
{
  "type": "order.created",
  "timestamp": 1704067200000,
  "correlationId": "uuid",
  "data": {
    "orderId": "order123",
    "userId": "user456",
    "totalAmount": 99.99,
    "items": [
      {
        "productId": "product789",
        "quantity": 2,
        "price": 49.99
      }
    ],
    "status": "PENDING"
  }
}
```

### PAYMENT_SUCCESS
Fired when payment is successfully processed

```json
{
  "type": "payment.success",
  "timestamp": 1704067201000,
  "correlationId": "uuid",
  "data": {
    "paymentId": "payment123",
    "orderId": "order123",
    "userId": "user456",
    "amount": 99.99,
    "stripePaymentIntentId": "pi_xxx"
  }
}
```

### PAYMENT_FAILED
Fired when payment processing fails

```json
{
  "type": "payment.failed",
  "timestamp": 1704067202000,
  "correlationId": "uuid",
  "data": {
    "paymentId": "payment123",
    "orderId": "order123",
    "userId": "user456",
    "amount": 99.99,
    "reason": "insufficient_funds"
  }
}
```

### USER_REGISTERED
Fired when new user registers

```json
{
  "type": "user.registered",
  "timestamp": 1704067203000,
  "correlationId": "uuid",
  "data": {
    "userId": "user456",
    "email": "user@example.com",
    "createdAt": 1704067203000
  }
}
```

## API Endpoints

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "analytics-service",
  "timestamp": "2024-01-01T12:00:00Z",
  "uptime": 1234.56
}
```

### Get Daily Metrics

```bash
GET /analytics/metrics/daily?date=2024-01-15
```

Response:
```json
{
  "date": "2024-01-15",
  "totalOrders": 42,
  "totalRevenue": 4299.58,
  "successfulPayments": 40,
  "failedPayments": 2,
  "averageOrderValue": 102.37,
  "newUsers": 8
}
```

### Get Metrics Range

```bash
GET /analytics/metrics/range?startDate=2024-01-01&endDate=2024-01-31
```

Response:
```json
[
  {
    "date": "2024-01-01",
    "totalOrders": 150,
    "totalRevenue": 15234.50,
    "successfulPayments": 148,
    "failedPayments": 2,
    "averageOrderValue": 101.56,
    "newUsers": 32
  },
  ...
]
```

## Event Processing Flow

### 1. Order Creation Flow

```
Order Service                  RabbitMQ              Analytics Service
    │                              │                       │
    ├─ Create Order ──────────────┤                       │
    │                              │                       │
    ├─ Publish ORDER_CREATED event─┤                       │
    │                              │                       │
    │                              ├─ Create topic exchange
    │                              │  with topic routing key
    │                              │                       │
    │                              ├─ Route to queue ─→   │
    │                              │                       │
    │                              │  ← Process event  │
    │                              │                       │
    │                              │  ← Record analytics
    │                              │                       │
    │                              │  ← Update metrics
    │                              │                       │
    return OrderResponse ←─────────────────────────────────│
```

### 2. Payment Success Flow

```
Payment Service               RabbitMQ            Order Service       Analytics
      │                           │                   │                  │
      ├─ Confirm Payment ─────────┤                   │                  │
      │                           │                   │                  │
      ├─ Publish PAYMENT_SUCCESS ─┤                   │                  │
      │                           │                   │                  │
      │                           ├─ Bind to           │                  │
      │                           │  payment.success   │                  │
      │                           │                   │                  │
      │                           ├──────────────────→ │                  │
      │                           │                   ├─ Update order   │
      │                           │                   │  status: PAID  │
      │                           │                                      │
      │                           ├─ Also route to    │
      │                           │  analytics queue ──→ Record payment
      │                           │                      Update metrics
      │                           │
      return response ←─────────────────────────────────────────────────
```

## Data Models

### OrderAnalytics
```typescript
{
  orderId: string;
  userId: string;
  totalAmount: number;
  itemCount: number;
  timestamp: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered';
}
```

### PaymentAnalytics
```typescript
{
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  status: 'succeeded' | 'failed';
  timestamp: number;
}
```

### UserAnalytics
```typescript
{
  userId: string;
  email: string;
  registeredAt: number;
  lastActivityAt: number;
}
```

### DailyMetrics
```typescript
{
  date: string;           // YYYY-MM-DD
  totalOrders: number;
  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  averageOrderValue: number;
  newUsers: number;
}
```

## Integration with Other Services

### In Order Service

```typescript
import { getEventPublisher } from './config/messaging';
import { EventType, OrderCreatedEvent } from './infrastructure/messaging/events';

// When creating order
const order = await createOrder(userId, items);

const event: OrderCreatedEvent = {
  type: EventType.ORDER_CREATED,
  timestamp: Date.now(),
  correlationId: req.headers['x-request-id'] as string,
  data: {
    orderId: order.id,
    userId: order.userId,
    totalAmount: order.totalAmount,
    items: order.items,
    status: 'PENDING',
  },
};

const publisher = getEventPublisher();
await publisher.publish(event, correlationId);
```

### In Payment Service

```typescript
import { publishPaymentSuccessEvent } from './application/use-cases/publish-payment-events';

// When payment succeeds
await publishPaymentSuccessEvent(
  paymentId,
  orderId,
  userId,
  amount,
  stripePaymentIntentId,
  correlationId
);
```

## Database (Production)

Replace `InMemoryAnalyticsRepository` with MongoDB-based repository:

```typescript
import { MongoDBAnalyticsRepository } from './infrastructure/db/mongodb-analytics-repository';

// In server initialization
const repository = new MongoDBAnalyticsRepository(mongoClient);
```

## Error Handling

Errors are logged with correlation IDs for tracing:

```
[14:30:25.123] ERROR (123): Error handling event message
  correlationId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  eventType: "order.created"
  error: "Connection timeout"
```

## Monitoring

### Health Check

```bash
curl http://localhost:4006/health
```

### Ready Probe

```bash
curl http://localhost:4006/ready
```

## Troubleshooting

### Connection to RabbitMQ fails
- Verify RabbitMQ is running: `docker ps | grep rabbitmq`
- Check `RABBITMQ_URL` in `.env`
- Verify credentials match RabbitMQ configuration

### Events not received
- Check event subscriptions in `consumer.ts`
- Verify routing keys match event types
- Check RabbitMQ Management UI for queue bindings

### Memory leaks
- Monitor in-memory repository size
- Implement data retention policies
- Switch to persistent storage (MongoDB)

## Performance Optimization

### Current (In-Memory)
- **Latency:** <1ms
- **Storage:** Limited by available RAM
- **Retention:** Session-based

### MongoDB Migration
- **Latency:** ~5-10ms
- **Storage:** Unlimited
- **Retention:** Persistent
- Enable TTL indexes for automatic cleanup

## Notes

- All timestamps are Unix milliseconds
- Correlation IDs track requests across services
- In-memory repository is for development only
- Production setup requires MongoDB and proper indexing
- Consider implementing retention policies for metrics
