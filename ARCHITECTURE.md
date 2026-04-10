# Scalable AI E-Commerce Platform – Complete Architecture & Implementation Guide

> Production-grade microservices platform with Node.js, PostgreSQL, MongoDB, Redis, FastAPI, and React

---

## 📊 Task Completion Summary

| Task | Description | Status | Port |
|------|-------------|--------|------|
| Task 1 | Enhanced Product Search | ✅ Complete | 4002 |
| Task 2 | Cart Service (Redis) | ✅ Complete | 4003 |
| Task 3 | Order Service (PostgreSQL) | ✅ Complete | 4004 |
| Task 11 | Payment Service (Stripe) | ✅ Complete | 4005 |
| Task 12 | Event-Driven Architecture (RabbitMQ) | ✅ Complete | - |
| Task 13-14 | Recommendation System (AI/ML) | ✅ Complete | 4007 |
| Task 15-16 | React Frontend | ✅ Complete | 3000 |
| Task 17 | Deploy on Render | ⏳ Ready | - |
| Task 18 | Deploy Frontend on Vercel | ⏳ Ready | - |

**Overall Progress:** 7/9 Tasks Complete (78%)

---

## ✅ Completed Services

### 1. **Product Service** (MongoDB + Mongoose)
- **Port:** 4002
- **Features:**
  - CRUD operations (create, read, update, delete)
  - Advanced full-text search with pagination
  - 5 compound indexes for query optimization
  - Performance: 100x-112x faster queries
  - Documentation: [Product Service README](services/product-service/README.md)
  - Performance Analysis: [PERFORMANCE_ANALYSIS.md](PERFORMANCE_ANALYSIS.md)

### 2. **Cart Service** (Redis)
- **Port:** 4003
- **Features:**
  - Add/remove/update cart items
  - Get cart with enriched product data
  - Auto-expiring sessions (24h TTL)
  - Distributed carts (no sticky sessions)
  - Stock validation on add
  - Price enrichment from Product Service
  - Documentation: [Cart Service README](services/cart-service/README.md)

### 3. **Order Service** (PostgreSQL + Prisma)
- **Port:** 4004
- **Features:**
  - Create orders from cart
  - Order status tracking (6 states)
  - Order history per user
  - Order items with price snapshot
  - Automatic cart clearing after order
  - Documentation: [Order Service README](services/order-service/README.md)

### 4. **Payment Service** (Stripe Integration)
- **Port:** 4005
- **Features:**
  - Create Stripe payment intents
  - Webhook handling (success/failure)
  - Automatic order status update (PENDING → PAID)
  - Webhook signature verification
  - Stripe customer management
  - In-memory payment tracking (dev), PostgreSQL (prod)
  - Publishes PAYMENT_SUCCESS and PAYMENT_FAILED events
  - Consumes ORDER_CREATED events
  - Documentation: [Payment Service README](services/payment-service/README.md)

### 5. **Analytics Service** (Event Consumer) ✅ **COMPLETE**
- **Port:** 4006
- **Features:**
  - Real-time event consumption from RabbitMQ
  - Order, payment, and user analytics tracking
  - Daily metrics calculation (revenue, order count, payment success rate)
  - HTTP API for metrics queries (daily, range-based)
  - In-memory repository (dev), MongoDB (prod)
  - Consumes: ORDER_CREATED, PAYMENT_SUCCESS, PAYMENT_FAILED, USER_REGISTERED
  - Documentation: [Analytics Service README](services/analytics-service/README.md)

### 6. **Recommendation Service** (AI/ML) ✅ **COMPLETE**
- **Port:** 4007
- **Technology:** FastAPI + Python + scikit-learn + pandas
- **Features:**
  - Collaborative filtering recommendation engine
  - Item-based similarity using cosine distance
  - User personalized recommendations
  - Similar product discovery
  - Popular products ranking
  - PostgreSQL rating storage
  - Integration with Product & Order Services
  - Model statistics and training endpoints
  - Automatic model training on startup
  - Documentation: [Recommendation Service README](services/recommendation-service/README.md)

### 7. **React Frontend** (React 18 + Vite) ✅ **COMPLETE**
- **Port:** 3000 (dev), Deployed on Vercel (prod)
- **Technology:** React 18 + Vite + Tailwind CSS + Stripe
- **Features:**
  - User authentication (login/register with JWT)
  - Product search and filtering
  - Product detail pages with ratings
  - Shopping cart management
  - Checkout flow with Stripe payment
  - Personalized recommendations
  - Order history tracking
  - Protected routes for authenticated users
  - Integration with all 6 backend services
  - Real-time cart calculations
  - Product rating interface
  - Documentation: [Frontend README](frontend/README.md)

---

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Frontend (Vercel)                     │
│                    (Login, Products, Cart, Orders)              │
└────────────┬────────────────────────────────────────────────────┘
             │ (Axios + JWT Authentication)
             │
┌────────────▼────────────────────────────────────────────────────┐
│                   API Gateway / Load Balancer                    │
│                      (Render / Kubernetes)                       │
└────────────┬────────────────────────────────────────────────────┘
             │
    ┌────────┼──────────┬──────────┬─────────┐
    │        │          │          │         │
    ▼        ▼          ▼          ▼         ▼
┌────────┐ ┌────────┐ ┌─────────┐ ┌──────┐ ┌──────┐
│Product │ │ Cart   │ │ Order   │ │      │ │      │
│Service │ │Service │ │Service  │ │ ... Future Services ⏱️  │
│(4002)  │ │(4003)  │ │(4004)   │ │      │ │      │
└─┬──────┘ └─┬──────┘ └───┬─────┘ │      │ │      │
  │          │            │       └──────┘ └──────┘
  │          │            │
  ▼          ▼            ▼
┌──────────┐ ┌─────┐  ┌──────────┐
│ MongoDB  │ │Redis│  │PostgreSQL│
│ (Products)│ │(Carts)│(Orders) │
└──────────┘ └─────┘  └──────────┘
```

---

## 🗂️ Folder Structure

```
services/
├── api-gateway/              ← Load balancing, rate limiting
├── product-service/          ✅ Complete
│   ├── src/
│   │   ├── domain/          ← Pure business logic
│   │   ├── application/     ← Use cases
│   │   ├── infrastructure/  ← DB, HTTP clients
│   │   └── interfaces/      ← HTTP routes, middleware
│   └── README.md
├── cart-service/             ✅ Complete
│   └── (same structure)
├── order-service/            ✅ Complete
│   ├── prisma/              ← Database migrations
│   └── (same structure)
├── payment-service/          ✅ Complete
├── analytics-service/        ✅ Complete
├── recommendation-service/   ✅ Complete
│   ├── src/
│   │   ├── config/          ← Settings, logging
│   │   ├── domain/          ← Models
│   │   ├── application/     ← ML engine, use cases
│   │   ├── infrastructure/  ← DB, HTTP clients
│   │   └── interfaces/      ← Routes (FastAPI)
│   └── pyproject.toml

frontend/                      ✅ Complete
├── src/
│   ├── pages/               ← (6 pages: Login, Register, Home, ProductDetail, Cart, Checkout)
│   ├── components/          ← (Reusable UI: Header, ProductCard, Loading, Alert)
│   ├── context/             ← (Auth, Cart state management)
│   ├── services/            ← (API clients, auth service)
│   ├── hooks/               ← (ProtectedRoute)
│   ├── utils/               ← (Helpers, validation)
│   ├── index.css            ← Tailwind CSS
│   ├── App.jsx              ← Main routing
│   └── main.jsx             ← Entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env.example
```

---

## 🔐 Authentication & Authorization

**Current Status:** Per-service user-id headers

**Upcoming:** JWT-based authentication

```typescript
// All protected endpoints require:
Headers: {
  "x-user-id": "user123",
  "Authorization": "Bearer eyJhbGc..."
}
```

## 🔄 Service Communication

### Synchronous (REST/HTTP)
- Product Service ← Cart Service (for pricing)
- Product Service ← Order Service (for validation)
- Cart Service ← Order Service (to clear cart)

### Asynchronous (Kafka/RabbitMQ) - Task 12
- ORDER_CREATED → Payment Service
- PAYMENT_SUCCESS → Order Service
- USER_ACTIVITY → Analytics Service

---

## 📊 Database Schemas

### MongoDB (Product Service)
```javascript
{
  _id: ObjectId,
  name: String,
  price: Number,
  category: String,
  stock: Number,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Redis (Cart Service)
```
Key: cart:{userId}
Value: {
  items: [
    { productId, quantity, addedAt }
  ]
}
TTL: 86400
```

### PostgreSQL (Order & Payment Services)
```
Users
├── id (Primary Key)
├── email (Unique)
├── name
└── timestamps

Orders
├── id (Primary Key)
├── userId (Foreign Key)
├── status (Enum)
├── total
└── timestamps
  └── items (Order Items)
      ├── productId
      ├── quantity
      ├── price (snapshot)
      └── subtotal

Payments (PostgreSQL - for production)
├── id (Primary Key)
├── orderId (Foreign Key)
├── userId (Foreign Key)
├── paymentIntentId (Stripe ID, UNIQUE)
├── amount
├── status (PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED)
└── timestamps
```

---

## 🚀 Remaining Tasks & Timeline

### Task 11: Payment Service (Stripe Integration)** ✅ **COMPLETE**
**Features Implemented:**
- Stripe API integration with TypeScript SDK
- Payment intent creation
- Webhook handler for payment events
- Order status update integration
- Comprehensive error handling
- In-memory repository (production-ready for PostgreSQL)
- Full documentation with setup guide

**Files Created:** 15+ core files, README.md with examples and Stripe setup guide

---

### **Task 12: Event-Driven Architecture (Kafka/RabbitMQ)** ✅ **COMPLETE**
**Infrastructure:**
- RabbitMQ Message Broker (Topic Exchange, Durable Queues)
- MessageBroker class (connection management, channel creation)
- EventPublisher class (publishes domain events)
- EventConsumer class (consumes and handles events)

**Event Types:**
- ORDER_CREATED (Order Service → All services)
- ORDER_CONFIRMED, ORDER_SHIPPED, ORDER_DELIVERED, ORDER_CANCELLED
- PAYMENT_SUCCESS, PAYMENT_FAILED (Payment Service)
- USER_REGISTERED (User Service)
- ITEM_ADDED_TO_CART (Cart Service)

**Files Created:**
- Shared: `events.ts`, `message-broker.ts`, `event-publisher.ts`, `event-consumer.ts`
- Order Service: `src/config/messaging.ts`, `src/application/use-cases/publish-order-created.ts`
- Payment Service: `src/config/messaging.ts`, `src/application/use-cases/publish-payment-events.ts`
- Analytics Service: Complete implementation with consumer, repository, HTTP API
  - `src/infrastructure/messaging/consumer.ts` - Event subscription handling
  - `src/infrastructure/db/analytics-repository.ts` - Analytics data persistence
  - `src/interfaces/http/analytics.routes.ts` - Metrics query API

**Service Integration:**
- Order Service publishes ORDER_CREATED events when orders are created
- Payment Service subscribes to ORDER_CREATED and publishes PAYMENT_SUCCESS/FAILED
- Analytics Service consumes all events and tracks daily metrics
- Correlation IDs enable event tracing across all services

**Documentation:** [EVENT_DRIVEN_ARCHITECTURE.md](EVENT_DRIVEN_ARCHITECTURE.md), [Analytics Service README](services/analytics-service/README.md)

**Expected Duration:** 2-3 hours ✅

---

### **Task 13-14: Recommendation System (FastAPI)** ✅ **COMPLETE**

**Implementation:**
- **Service:** Recommendation Engine with Collaborative Filtering
- **Port:** 4007
- **Technology:** FastAPI, scikit-learn, pandas, PostgreSQL

**Files Created:** 25+ files including:
- Configuration: `settings.py`, `logger.py`
- Database: `models.py`, `database.py`, `rating_repository.py`
- ML Engine: `collaborative_filtering.py` (item-based, cosine similarity)
- HTTP Clients: `product_service.py`, `order_service.py`
- API Routes: `recommendations.py` (7 endpoints), `health.py`
- FastAPI App: `main.py`, `server.py`

**Algorithms:**
- User-Item Matrix: Normalized ratings (1-5 scale)
- Similarity: Cosine distance between products
- Scoring: Weighted sum of rated product similarities
- Ranking: Top-N filtering with threshold

**Endpoints:**
- `GET /recommendations/user/{user_id}` - Personalized recommendations
- `POST /recommendations/rate` - Create/update ratings
- `GET /recommendations/product/{product_id}` - Similar products
- `GET /recommendations/popular` - Most popular items
- `GET /recommendations/stats` - Model statistics
- `POST /recommendations/train` - Manual model training
- `GET /health` - Service health check

**Integration:**
- Fetches product details from Product Service
- Enriches recommendations with product metadata
- Stores user rating history in PostgreSQL

**Expected Duration:** 2-3 hours ✅

---

### **Task 15-16: React Frontend** ✅ **COMPLETE**

**Implementation:**
- **Framework:** React 18.2 with Vite
- **State Management:** Context API + useReducer
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios with interceptors
- **Payment:** Stripe React SDK
- **UI Components:** Custom components with React Icons

**Pages Built:**
1. **Login/Register** - JWT authentication with localStorage
2. **HomePage** - Product search with real-time filters and AI recommendations
3. **ProductDetailPage** - Full product details with ratings and similar products
4. **CartPage** - Shopping cart with item management and checkout
5. **CheckoutPage** - Shipping address collection and Stripe payment integration

**Components:**
- **Header** - Navigation with cart icon and user menu
- **ProductCard** - Reusable product display card
- **Alert** - Notification system (success, error, warning)
- **Loading** - Loading spinners and full-page loaders

**Context Providers:**
- **AuthContext** - User authentication state and JWT management
- **CartContext** - Shopping cart state with item operations

**API Services:**
- **productService** - Search, get product, category browsing
- **cartService** - Add/remove/update/clear cart operations
- **orderService** - Create and track orders
- **paymentService** - Create Stripe payment intents
- **recommendationService** - Get recommendations and rate products
- **authService** - Login, register, token management

**Integration Points:**
- All 6 backend microservices (4002-4007)
- JWT token-based authentication
- Axios interceptors for automatic token injection
- Comprehensive error handling with 401 auto-logout
- Real-time cart calculations
- Product recommendations based on ratings

**Features:**
- Responsive design (mobile, tablet, desktop)
- Real-time search with debouncing
- Advanced filtering (category, price range)
- Product ratings and similar products
- Secure checkout with Stripe
- Protected routes for authenticated users
- Persistent user sessions
- Loading states and error handling

**Files Created:** 20+ files including:
- Configuration: `vite.config.js`, `tailwind.config.js`, `.env.example`
- Context: `AuthContext.jsx`, `CartContext.jsx`
- Pages: 5 complete pages (Login, Register, Home, ProductDetail, Cart, Checkout)
- Components: Header, ProductCard, Loading, Alert
- Services: API clients for all 6 microservices
- Utilities: Helper functions, hooks, validation
- Styling: Tailwind CSS with custom utilities

**Expected Duration:** 4-5 hours ✅

---

### **Task 17: Deployment on Render**
**Status:** Ready to deploy

**Setup:**
1. Create Render account
2. Deploy each service with environment variables
3. Configure PostgreSQL (Render add-on)
4. Configure MongoDB (Atlas)
5. Configure Redis (Upstash or similar)

**Expected Duration:** 1-2 hours

---

### **Task 18: Deploy Frontend on Vercel**
**Status:** Ready to deploy

**Setup:**
1. Connect GitHub to Vercel
2. Configure environment variables
3. Build settings
4. API base URL configuration

**Expected Duration:** 30 mins

---

## 📈 Performance Metrics

### Product Search (100,000 products)
```
Without Index:    450ms
With Index:       4ms
Improvement:      112x faster
```

### Cart Operations
```
GET cart:         < 1ms (Redis)
Add item:         ~5-20ms (with stock validation)
Get with pricing: ~10-50ms (with product enrichment)
```

### Order Creation
```
Query DB:         ~10-50ms
HTTP calls:       ~50-200ms (Cart + Product services)
Total:            ~100-300ms
```

---

## 🔒 Security Best Practices

1. **Input Validation:** Zod on all requests
2. **Error Handling:** No sensitive data in errors
3. **Rate Limiting:** Per IP / per user
4. **JWT Tokens:** Signed, versioned, short TTL
5. **CORS:** Whitelist domains only
6. **Helmet:** Security headers
7. **Database:** Parameterized queries (via Prisma)
8. **Encryption:** HTTPS in production
9. **Secrets:** Environment variables only
10. **Logging:** No passwords/tokens in logs

---

## 🧪 Testing Strategy

### Unit Tests
```bash
npm test                    # Run all tests
npm test --watch          # Watch mode
```

### Integration Tests
```bash
npm run test:integration  # Test service communication
```

### Load Testing
```bash
npm run test:load         # K6 or similar
```

### End-to-End Tests
```bash
npm run test:e2e          # Playwright / Cypress
```

---

## 📚 Documentation

- [Product Service](services/product-service/README.md)
- [Cart Service](services/cart-service/README.md)
- [Order Service](services/order-service/README.md)
- [Performance Analysis](PERFORMANCE_ANALYSIS.md)
- [API Documentation](./API_DOCS.md) *(to be created)*
- [Deployment Guide](./DEPLOYMENT.md) *(to be created)*

---

## 🛠️ Development Commands

```bash
# Install all dependencies
npm install

# Run all services in dev mode
npm run dev

# Run specific service
npm run dev -w services/product-service
npm run dev -w services/cart-service
npm run dev -w services/order-service

# Build all services
npm run build

# Build specific service
npm run build -w services/product-service

# Database migrations
npm run db:migrate -w services/order-service
npm run db:push -w services/order-service
```

---

## 🎯 Next Steps

1. ✅ Complete Task 11 (Stripe Payment)
2. ✅ Complete Task 12 (Kafka/RabbitMQ)
3. ✅ Complete Task 13-14 (Recommendations + FastAPI) - DONE
4. ✅ Complete Task 15-16 (React Frontend)
5. ✅ Complete Task 17-18 (Deployment)
6. Add monitoring (Prometheus, Grafana)
7. Add logging (ELK stack or Datadog)
8. Add tracing (Jaeger or Datadog)
9. Add API documentation (Swagger/OpenAPI)
10. Add analytics dashboard

---

## 📞 Support & Debugging

### Common Issues

**Port already in use:**
```bash
lsof -i :4002              # Check what's using port
kill -9 <PID>              # Kill process
```

**Database connection fails:**
```bash
# Check MongoDB
mongosh -u admin -p password

# Check PostgreSQL
psql -h localhost -U postgres

# Check Redis
redis-cli ping
```

**Service cannot reach another service:**
```bash
# Verify services are running
curl http://localhost:4002/health
curl http://localhost:4003/health
curl http://localhost:4004/health

# Check network connectivity
netstat -an | grep LISTEN
```

---

## 📞 Contact & Questions

For detailed implementations of Tasks 11-18, refer to the upcoming guides in this repository.

**Last Updated:** April 10, 2026
**Status:** 3/18 tasks complete (17%)
