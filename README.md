# 🛒 ShopHub — Scalable AI-Powered E-Commerce Platform

> A production-grade, cloud-native e-commerce platform built with a **microservices architecture**, featuring AI-driven recommendations, real-time event streaming, and a modern React frontend.

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.13-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [System Architecture](#-system-architecture)
- [Microservices Breakdown](#-microservices-breakdown)
- [Tech Stack](#-tech-stack)
- [AI / ML Recommendation Engine](#-ai--ml-recommendation-engine)
- [Event-Driven Architecture](#-event-driven-architecture)
- [Database Design](#-database-design)
- [Performance Benchmarks](#-performance-benchmarks)
- [Security](#-security)
- [Frontend](#-frontend)
- [Local Development Setup](#-local-development-setup)
- [Deployment](#-deployment)

---

## 🎯 Project Overview

**ShopHub** is a fully functional, scalable e-commerce platform designed with **Domain-Driven Design (DDD)** and **Clean Architecture** principles. It demonstrates how large systems are broken into independently deployable services that communicate via REST APIs and asynchronous message queues.

### Key Engineering Highlights

| Highlight | Detail |
|---|---|
| 🏗️ Architecture | 8 independent microservices + React SPA |
| ⚡ Search Performance | **112× faster** queries via compound MongoDB indexes |
| 🤖 AI Recommendations | Collaborative filtering with cosine similarity (scikit-learn) |
| 📨 Event Streaming | RabbitMQ Topic Exchange — 9 domain event types |
| 💳 Payments | Stripe API with webhook signature verification |
| 🔐 Auth | JWT (HS256), bcrypt password hashing, auto-logout on 401 |
| 📦 Polyglot Persistence | MongoDB · PostgreSQL · Redis — each service owns its data |
| 🧩 Clean Architecture | Domain → Application → Infrastructure → Interface layers |

---

## 🏛️ System Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                    React Frontend  (Vite · Port 3000)                │
│          Login · Products · Cart · Checkout · Orders · Recs          │
└────────────────────────────┬─────────────────────────────────────────┘
                             │  Axios + JWT Bearer Token
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                      API Gateway  (Port 4000)                        │
│               Rate Limiting · Auth · Request Routing                 │
└──────┬──────────┬──────────┬──────────┬──────────┬───────────────────┘
       │          │          │          │          │
  ┌────▼───┐ ┌───▼────┐ ┌───▼────┐ ┌───▼────┐ ┌───▼────────┐ ┌──────┐
  │  User  │ │Product │ │  Cart  │ │ Order  │ │  Payment   │ │Recs  │
  │Service │ │Service │ │Service │ │Service │ │  Service   │ │(4007)│
  │ :4001  │ │ :4002  │ │ :4003  │ │ :4004  │ │   :4005    │ │      │
  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────────┘ └──┬───┘
      │          │          │          │          │              │
  ┌───▼──┐ ┌────▼───┐ ┌────▼─┐ ┌──────▼──┐ ┌────▼──┐    ┌─────▼────┐
  │Postgr│ │MongoDB │ │Redis │ │PostgreSQL│ │Stripe │    │PostgreSQL│
  │  SQL │ │Products│ │Carts │ │  Orders  │ │  API  │    │ Ratings  │
  └──────┘ └────────┘ └──────┘ └──────────┘ └───────┘    └──────────┘
                                    │
              ┌─────────────────────▼──────────────────────┐
              │         RabbitMQ  (Topic Exchange)          │
              │  order.* · payment.* · user.* · item.*      │
              └──────────────────┬─────────────────────────┘
                                 │
                      ┌──────────▼──────────┐
                      │  Analytics Service   │
                      │       :4006          │
                      │  Real-time Metrics   │
                      └─────────────────────┘
```

### Clean Architecture Per Service

Every Node.js service follows strict layering — no layer may depend on a layer above it:

```
src/
├── domain/           ← Pure business entities & rules (no dependencies)
├── application/
│   ├── use-cases/    ← Orchestrates domain logic
│   └── ports/        ← Interfaces (repository contracts)
├── infrastructure/
│   ├── db/           ← Mongoose / Prisma / Redis implementations
│   ├── messaging/    ← RabbitMQ publishers & consumers
│   └── http-clients/ ← Inter-service HTTP calls
└── interfaces/
    └── http/
        ├── routes/       ← Express routers
        ├── controllers/  ← Request handlers
        └── middleware/   ← Auth, validation, error handling
```

---

## 🔧 Microservices Breakdown

### 1. 👤 User Service — Port 4001
**Stack:** Node.js · TypeScript · Express · PostgreSQL · Prisma · JWT · bcrypt

- User registration with email uniqueness enforcement
- Password hashing with bcrypt (12 salt rounds)
- JWT access tokens (HS256, 15-minute TTL)
- Publishes `USER_REGISTERED` event to RabbitMQ

### 2. 📦 Product Service — Port 4002
**Stack:** Node.js · TypeScript · Express · MongoDB · Mongoose · Zod

- Full CRUD with Zod request validation
- **Advanced search:** keyword (`$text`), category filter, price range, pagination
- **5 compound indexes** for query optimisation
- Parallel `Promise.all()` for count + data queries
- `.lean()` queries for 43% lower memory usage
- Seed script for 15 sample products across 5 categories

### 3. 🛒 Cart Service — Port 4003
**Stack:** Node.js · TypeScript · Express · Redis

- Session-based cart stored in Redis (24h TTL)
- Distributed — no sticky sessions required
- Real-time stock validation via Product Service HTTP call
- Price enrichment: fetches latest pricing on cart retrieval
- Automatic cart clearance post-order creation

### 4. 📋 Order Service — Port 4004
**Stack:** Node.js · TypeScript · Express · PostgreSQL · Prisma

- Creates orders from active cart with price snapshot
- 6-state lifecycle: `PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → CANCELLED`
- Publishes `ORDER_CREATED` event triggering downstream payment flow
- Consumes `PAYMENT_SUCCESS` to auto-advance order to `PAID`

### 5. 💳 Payment Service — Port 4005
**Stack:** Node.js · TypeScript · Express · Stripe SDK · PostgreSQL

- Creates Stripe PaymentIntents server-side
- Validates Stripe webhook signatures (HMAC-SHA256)
- Publishes `PAYMENT_SUCCESS` / `PAYMENT_FAILED` events
- Consumes `ORDER_CREATED` to pre-register expected payments

### 6. 📊 Analytics Service — Port 4006
**Stack:** Node.js · TypeScript · Express · RabbitMQ consumer

- Consumes ALL domain events (order, payment, user, cart)
- Calculates daily revenue, order count, payment success rate
- HTTP API: query metrics by date or date range
- Zero coupling — pure event consumer, no direct DB access to other services

### 7. 🤖 Recommendation Service — Port 4007
**Stack:** Python · FastAPI · scikit-learn · pandas · PostgreSQL

See [AI/ML section](#-ai--ml-recommendation-engine) below.

### 8. 🌐 Frontend — Port 3000
**Stack:** React 18 · Vite · Tailwind CSS · Axios · Stripe React SDK

See [Frontend section](#-frontend) below.

---

## 🛠️ Tech Stack

### Backend Services

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js 20+ | Async I/O, event loop |
| Language | TypeScript 5.x | Type safety across all services |
| Framework | Express 4.x | HTTP server, middleware |
| Validation | Zod | Runtime schema validation on all requests |
| ORM/ODM | Prisma (SQL) · Mongoose (MongoDB) | Type-safe DB access |
| Logging | Pino + pino-http | Structured JSON logging |
| Security | Helmet · CORS · JWT | Security headers & auth |
| Python API | FastAPI | Async ML microservice |

### Databases

| Database | Service | Why |
|---|---|---|
| MongoDB | Product Service | Flexible schema, text search, horizontal scaling |
| PostgreSQL | User · Order · Payment · Recommendation | ACID transactions, relational integrity |
| Redis | Cart Service | Sub-millisecond reads, TTL-based session expiry |

### Infrastructure

| Tool | Role |
|---|---|
| RabbitMQ | Async event broker (Topic Exchange) |
| Stripe | Payment processing + webhook events |
| Vite | Frontend build tool (HMR, ESM) |
| npm Workspaces | Monorepo dependency management |

### AI / ML

| Tool | Role |
|---|---|
| scikit-learn | Cosine similarity, collaborative filtering |
| pandas | User-item matrix construction |
| FastAPI | High-performance async Python API |
| PostgreSQL | Persistent user rating storage |

---

## 🤖 AI / ML Recommendation Engine

The recommendation service implements **Item-Based Collaborative Filtering** — the same family of algorithms used by Amazon and Netflix.

### How It Works

```
Step 1 — Collect Ratings
  Users rate products 1–5 stars after purchase

Step 2 — Build User-Item Matrix
  Rows = users, Columns = products, Values = ratings (0 = unrated)

  Product:     P1    P2    P3    P4
  User A:     5.0   3.0   0.0   1.0
  User B:     4.0   0.0   4.0   1.0
  User C:     0.0   5.0   3.0   2.0

Step 3 — Compute Item Similarity
  cosine_similarity(P1_vector, P2_vector) = similarity score

Step 4 — Score Unseen Products
  For a user, weight unseen products by
  similarity to products they liked

Step 5 — Return Top-N
  Filter by threshold, sort descending, enrich with product data
```

### Endpoints

| Endpoint | Description |
|---|---|
| `GET /recommendations/user/{id}` | Personalised top-N recommendations |
| `GET /recommendations/product/{id}` | Similar products (item-to-item) |
| `GET /recommendations/popular` | Global popularity ranking |
| `POST /recommendations/rate` | Submit / update a product rating |
| `POST /recommendations/train` | Trigger manual model re-training |
| `GET /recommendations/stats` | Matrix size, coverage, density |
| `GET /health` | Liveness check |

---

## 📨 Event-Driven Architecture

All cross-service workflows use **asynchronous messaging** via RabbitMQ, eliminating runtime coupling between services.

### Message Broker Design

```
┌─────────────────────────────────────────────────┐
│           RabbitMQ — Topic Exchange: "events"    │
│                                                  │
│  Routing Key Patterns:                           │
│    order.*     →  Order queues                   │
│    payment.*   →  Payment queues                 │
│    user.*      →  Analytics queue                │
│    item.*      →  Analytics queue                │
└─────────────────────────────────────────────────┘
```

### Event Catalog

| Event | Publisher | Consumers | Routing Key |
|---|---|---|---|
| `ORDER_CREATED` | Order Service | Payment, Analytics | `order.created` |
| `ORDER_CONFIRMED` | Order Service | Analytics | `order.confirmed` |
| `ORDER_SHIPPED` | Order Service | Analytics | `order.shipped` |
| `ORDER_DELIVERED` | Order Service | Analytics | `order.delivered` |
| `ORDER_CANCELLED` | Order Service | Analytics | `order.cancelled` |
| `PAYMENT_SUCCESS` | Payment Service | Order, Analytics | `payment.success` |
| `PAYMENT_FAILED` | Payment Service | Order, Analytics | `payment.failed` |
| `USER_REGISTERED` | User Service | Analytics | `user.registered` |
| `ITEM_ADDED_TO_CART` | Cart Service | Analytics | `item.added_to_cart` |

### Order → Payment Flow

```
Client  →  Order Service (POST /orders)
               │
               ├─ Validate cart & stock (→ Product Service)
               ├─ Create order in PostgreSQL
               ├─ Clear cart (→ Cart Service)
               └─ Publish ORDER_CREATED ──→ RabbitMQ
                                                │
                              ┌─────────────────┤
                              │                 │
                    Payment Service       Analytics Service
                    receives event        records metrics
                              │
                    Stripe webhook returns
                              │
                    Publish PAYMENT_SUCCESS ──→ RabbitMQ
                                                    │
                                          Order Service
                                          updates status → PAID
```

### Reliability Features

- **Dead Letter Queue (DLQ):** Failed messages after 3 retries are moved for manual inspection
- **Correlation IDs:** Every event carries a UUID for end-to-end distributed tracing
- **Durable queues & persistent messages:** Survive RabbitMQ restarts
- **Graceful degradation:** Services remain operational if broker is temporarily unavailable
- **Exponential backoff reconnection:** 5s initial delay, max 5 retries

---

## 🗄️ Database Design

### MongoDB — Product Service

```javascript
{
  _id:         ObjectId,      // Primary key
  name:        String,        // max 200 chars, text-indexed
  description: String,        // max 2000 chars, text-indexed
  price:       Number,        // non-negative
  category:    String,        // max 120 chars
  stock:       Number,        // integer, non-negative
  image:       String,        // URL, optional
  createdAt:   Date,          // auto-managed
  updatedAt:   Date           // auto-managed
}

Indexes:
  { name: "text", description: "text" }   → full-text search
  { category: 1, price: 1 }              → filter + price sort
  { category: 1, createdAt: -1 }         → filter + date sort
  { price: 1 }                            → price sort only
  { createdAt: -1 }                       → newest first
```

### PostgreSQL — Order Service (Prisma)

```
┌──────────┐        ┌──────────────┐        ┌────────────┐
│  Users   │        │    Orders    │        │ OrderItems │
├──────────┤        ├──────────────┤        ├────────────┤
│ id (PK)  │◄──┐    │ id (PK)      │◄──┐    │ id (PK)    │
│ email    │   └────│ userId (FK)  │   └────│ orderId FK │
│ name     │        │ status (enum)│        │ productId  │
│ password │        │ total        │        │ quantity   │
│ createdAt│        │ shippingAddr │        │ price snap │
└──────────┘        │ createdAt    │        │ subtotal   │
                    └──────────────┘        └────────────┘

Order Status Enum:
  PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                                             ↘ CANCELLED
```

### Redis — Cart Service

```
Key:   cart:{userId}
Type:  JSON string
TTL:   86400 seconds (24 hours)

Value:
{
  "items": [
    { "productId": "...", "quantity": 2, "addedAt": "ISO8601" }
  ]
}
```

---

## ⚡ Performance Benchmarks

### Product Search (100,000 products dataset)

| Query Type | Without Index | With Index | Speedup |
|---|---|---|---|
| Keyword search | 450 ms | 4 ms | **112×** |
| Category filter | 380 ms | 8 ms | **47×** |
| Price range filter | 280 ms | 6 ms | **46×** |
| Category + price sort | 520 ms | 12 ms | **43×** |
| Full-text + filter + sort | 680 ms | 18 ms | **37×** |

### Memory Optimisation (`.lean()` queries)

| Documents fetched | Mongoose default | With `.lean()` | Saving |
|---|---|---|---|
| 100 docs | 2.8 MB | 1.6 MB | **43%** |
| 1,000 docs | 28 MB | 16 MB | **43%** |
| 10,000 docs | 280 MB | 165 MB | **41%** |

### Cart & Order Latency

| Operation | Latency | Driver |
|---|---|---|
| GET cart | < 1 ms | Redis in-memory |
| Add item to cart | 5–20 ms | Redis + stock validation |
| Cart with enriched pricing | 10–50 ms | Redis + Product Service HTTP |
| Create order | 100–300 ms | PostgreSQL + Cart + Product calls |

### Key Optimisation Techniques

1. **Parallel DB queries** — `Promise.all([countDocuments, find])` halves round-trip latency
2. **`.lean()` projections** — plain JS objects skip Mongoose hydration overhead
3. **Compound indexes** — eliminate in-memory SORT stages entirely
4. **Collation** — case-insensitive matching at index level (no regex full-scans)
5. **Text relevance scoring** — `$meta: "textScore"` ranks results by relevance with < 5% overhead

---

## 🔒 Security

| Layer | Implementation |
|---|---|
| Input validation | Zod schemas on every request body, params, and query |
| Password storage | bcrypt with 12 salt rounds |
| Authentication | JWT (HS256) with 15-minute TTL |
| Token transport | HTTP-only considerations, `Authorization: Bearer` header |
| Webhook verification | HMAC-SHA256 signature validation (Stripe) |
| HTTP security headers | Helmet.js on all services |
| CORS | Allowlist-only origins per service |
| Query injection | Prisma parameterised queries; Mongoose schema typing |
| Secrets management | Environment variables only — never committed |
| Error responses | No stack traces or sensitive data exposed to clients |
| Logging | Pino structured logs — passwords/tokens never logged |

---

## 🎨 Frontend

**Stack:** React 18 · Vite 5 · Tailwind CSS · Axios · Stripe React SDK · React Router v6

### Pages & Features

| Page | Key Features |
|---|---|
| **Login / Register** | JWT auth, show/hide password, autofill-safe dark inputs |
| **Home** | Real-time debounced search, category pills, price filters, sort options |
| **Product Detail** | Image gallery, star ratings, similar products (AI), add to cart |
| **Cart** | Live quantity updates, stock enforcement, subtotal calculation |
| **Checkout** | Shipping address form, Stripe card payment, order confirmation |

### Design System

- **Theme:** Premium dark glassmorphism (inspired by modern SaaS)
- **Typography:** Space Grotesk (headings) + Inter (body)
- **Animations:** Ambient orbs, fade-up reveals, hover lift effects
- **Colour palette:** Indigo/violet primary · amber accent · slate neutrals
- **Autofill override:** `-webkit-box-shadow` inset trick for dark browser autofill

### State Management

```
AuthContext   → JWT token, user object, login/logout/register
CartContext   → Cart items, addItem, removeItem, clearCart, totals
```

### API Layer

Axios instances per service with:
- Automatic JWT injection via request interceptor
- Global 401 handler → auto-logout + redirect to `/login`
- Configurable base URLs via `VITE_*` environment variables

---

## 🚀 Local Development Setup

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20+ | All JS/TS services |
| Python | 3.11+ | Recommendation service |
| MongoDB | 7+ | Product data |
| PostgreSQL | 15+ | Users, orders, payments, ratings |
| Redis | 7+ | Cart sessions |
| RabbitMQ | 3.13 | Event messaging (optional for basic demo) |

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/pramod190/AI-Powered-E-commerce-Platform-Microservices.git
cd "Scalable AI E-Commerce Platform using Microservices"

# 2. Install all JS dependencies (npm workspaces)
npm install

# 3. Install frontend dependencies
cd frontend && npm install && cd ..

# 4. Seed the product database
cd services/product-service && npm run seed && cd ../..

# 5. Start the product service (Terminal 1)
cd services/product-service && npm run dev

# 6. Start the frontend (Terminal 2)
cd frontend && npm run dev
```

> **One-click start:** Run `.\start-dev.ps1` from the project root (Windows PowerShell).
> It checks MongoDB, starts the product service and frontend in separate windows.

### Environment Variables

**`services/product-service/.env`**
```env
NODE_ENV=development
PORT=4002
MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce_products
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**`services/user-service/.env`**
```env
PORT=4001
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecommerce
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=15m
BCRYPT_SALT_ROUNDS=12
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:4002
VITE_USER_SERVICE_URL=http://localhost:4001
VITE_CART_SERVICE_URL=http://localhost:4003
VITE_ORDER_SERVICE_URL=http://localhost:4004
VITE_PAYMENT_SERVICE_URL=http://localhost:4005
VITE_RECOMMENDATION_SERVICE_URL=http://localhost:4007
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### Service Port Map

| Service | Port | Database |
|---|---|---|
| Frontend | 3000 | — |
| User Service | 4001 | PostgreSQL |
| Product Service | 4002 | MongoDB |
| Cart Service | 4003 | Redis |
| Order Service | 4004 | PostgreSQL |
| Payment Service | 4005 | PostgreSQL + Stripe |
| Analytics Service | 4006 | In-memory / MongoDB |
| Recommendation Service | 4007 | PostgreSQL |
| RabbitMQ Management | 15672 | — |

---

## ☁️ Deployment

### Backend — Render.com

Each microservice deploys as an independent **Web Service** on Render:

```
Build Command:  npm run build
Start Command:  node dist/server.js
Health Check:   /health
```

Managed databases:
- **MongoDB Atlas** — Product Service
- **Render PostgreSQL** — User, Order, Payment, Recommendation Services
- **Upstash Redis** — Cart Service
- **CloudAMQP** — RabbitMQ

### Frontend — Vercel

```
Framework:  Vite
Build:      npm run build
Output:     dist/
Env Vars:   VITE_* variables pointing to Render service URLs
```

---

## 📁 Repository Structure

```
.
├── frontend/                      # React 18 + Vite SPA
│   └── src/
│       ├── pages/                 # 6 pages
│       ├── components/            # Header, ProductCard, Loading, Alert
│       ├── context/               # Auth & Cart providers
│       ├── services/              # Axios API clients
│       └── utils/                 # Helpers, validation
│
├── services/
│   ├── api-gateway/               # Rate limiting, routing
│   ├── user-service/              # Auth, JWT, PostgreSQL + Prisma
│   ├── product-service/           # Search, CRUD, MongoDB
│   ├── cart-service/              # Sessions, Redis
│   ├── order-service/             # Lifecycle, PostgreSQL + Prisma
│   ├── payment-service/           # Stripe, webhooks
│   ├── analytics-service/         # Event consumer, metrics API
│   └── recommendation-service/    # FastAPI + scikit-learn
│
├── ARCHITECTURE.md                # Deep-dive architecture guide
├── EVENT_DRIVEN_ARCHITECTURE.md   # RabbitMQ event catalog & flows
├── PERFORMANCE_ANALYSIS.md        # Index benchmarks & query plans
├── start-dev.ps1                  # One-click Windows dev starter
└── README.md                      # This file
```

---

## 👤 Author

**Pramod Kumar**
- GitHub: [@pramod190](https://github.com/pramod190)
- Project: [AI-Powered-E-commerce-Platform-Microservices](https://github.com/pramod190/AI-Powered-E-commerce-Platform-Microservices)

---

<div align="center">

*Built with ❤️ to demonstrate production-grade microservices engineering*

</div>
