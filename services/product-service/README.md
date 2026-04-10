# Product Service — `@services/product-service`

> Node.js · Express · TypeScript · MongoDB (Mongoose) · Zod · Clean Architecture

---

## Features

| Capability | Detail |
|---|---|
| CRUD | Create, Read, Update, Delete products |
| Advanced Search | `GET /products/search` — keyword, filters, pagination, sorting |
| Validation | Zod schemas on every request (body, params, query) |
| Error handling | Centralised `AppError` + typed middleware |
| Structured logging | Pino with request-id correlation |
| Security | Helmet, CORS, per-request ID header |
| DB | MongoDB via Mongoose, clean repository pattern |

---

## Folder Structure

```
services/product-service/
├── .env                          # Runtime env (gitignored)
├── .env.example                  # Env template
├── package.json
├── tsconfig.json
└── src/
    ├── server.ts                 # HTTP server bootstrap & graceful shutdown
    ├── app.ts                    # Express app factory
    ├── config/
    │   └── env.ts                # Zod-validated environment
    ├── domain/
    │   └── product.ts            # Pure domain type (no ORM dependency)
    ├── application/
    │   ├── ports/
    │   │   └── product-repository.ts   # Repository interface + search types
    │   └── use-cases/
    │       ├── create-product.ts
    │       ├── list-products.ts
    │       ├── get-product.ts
    │       ├── update-product.ts
    │       ├── delete-product.ts
    │       └── search-products.ts      ← NEW
    ├── infrastructure/
    │   ├── db/
    │   │   └── mongoose.ts
    │   ├── models/
    │   │   └── product.model.ts        ← compound indexes added
    │   └── repositories/
    │       └── mongo-product-repository.ts  ← search() implementation
    ├── interfaces/
    │   └── http/
    │       ├── controllers/
    │       │   └── product.controller.ts    ← search handler added
    │       ├── routes/
    │       │   ├── index.ts
    │       │   ├── health.routes.ts
    │       │   └── product.routes.ts        ← /products/search route
    │       ├── middleware/
    │       │   ├── request-id.ts
    │       │   ├── validate.ts
    │       │   ├── notFound.ts
    │       │   └── errorHandler.ts
    │       └── utils/
    │           └── async-handler.ts
    └── shared/
        ├── logger.ts
        └── errors/
            └── app-error.ts
```

---

## API Reference

### Basic CRUD

| Method | Path | Description |
|---|---|---|
| `POST` | `/products` | Create a product |
| `GET` | `/products` | List all products (no pagination) |
| `GET` | `/products/:id` | Get product by ID |
| `PATCH` | `/products/:id` | Partial update |
| `DELETE` | `/products/:id` | Delete product |
| `GET` | `/health` | Health check |

### Advanced Search — `GET /products/search`

All query parameters are optional.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `q` | string | — | Keyword search (name & description) |
| `category` | string | — | Filter by category (case-insensitive) |
| `minPrice` | number | — | Min price, inclusive |
| `maxPrice` | number | — | Max price, inclusive |
| `sortBy` | `price` \| `createdAt` | `createdAt` | Sort field |
| `sortOrder` | `asc` \| `desc` | `desc` | Sort direction |
| `page` | number | `1` | Page number (1-based) |
| `limit` | number | `20` | Items per page (max 100) |

#### Example requests

```bash
# Keyword search
GET /products/search?q=wireless+headphones

# Filter + sort
GET /products/search?category=Electronics&sortBy=price&sortOrder=asc

# Price range + pagination
GET /products/search?minPrice=100&maxPrice=500&page=2&limit=10

# Combined
GET /products/search?q=laptop&category=Electronics&minPrice=500&maxPrice=2000&sortBy=price&sortOrder=asc&page=1&limit=20
```

#### Response shape

```jsonc
{
  "data": [
    {
      "id": "663f1a2b...",
      "name": "Wireless Headphones",
      "price": 299.99,
      "category": "Electronics",
      "stock": 42,
      "description": "...",
      "createdAt": "2026-04-01T00:00:00.000Z",
      "updatedAt": "2026-04-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 87,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Performance Improvements

### 1. MongoDB Compound Indexes

| Index | Covers |
|---|---|
| `{ name: "text", description: "text" }` | Keyword search via `$text` |
| `{ category: 1, price: 1 }` | Category filter + price sort (no in-memory SORT) |
| `{ category: 1, createdAt: -1 }` | Category filter + newest sort |
| `{ price: 1 }` | Price sort without category filter |
| `{ createdAt: -1 }` | Default newest-first sort |

**Why it matters:** Without indexes, every search is an O(n) full collection scan. With the right compound index, MongoDB can resolve both the `match` and the `sort` stages from the B-Tree alone — no in-memory sort step, constant query time as collection grows.

### 2. Parallel count + data queries

```ts
const [total, docs] = await Promise.all([
  ProductModel.countDocuments(filter),
  ProductModel.find(filter).skip(skip).limit(limit).lean()
]);
```

Sequential would be `latency = count + find`. Parallel halves it to `latency = max(count, find)`.

### 3. `$text` over `$regex` for keyword search

`$regex` without an index performs a full collection scan and cannot use collation. `$text` with the text index is O(log n) and supports relevance ranking via `{ $meta: "textScore" }`.

### 4. `.lean()` for read queries

Mongoose documents are full class instances with getters/setters. `.lean()` returns plain JS objects — ~3–5× faster serialisation and lower memory footprint on large result sets.

### 5. Collation for case-insensitive category matching

```ts
.collation({ locale: "en", strength: 2 })
```

This avoids storing a lowercased copy of `category` and lets MongoDB handle case-insensitive comparison at the index level.

### 6. Dynamic filter object

The `filter` object is only populated with fields that were actually provided. An empty or sparse filter lets MongoDB choose the tightest index. Sending a static `{}` filter with every unused key would confuse the query planner.

---

## Validation Rules

### POST `/products`

| Field | Rule |
|---|---|
| `name` | required, max 200 chars |
| `price` | required, number ≥ 0 |
| `category` | required, max 120 chars |
| `stock` | required, integer ≥ 0 |
| `description` | optional, max 2000 chars |

### PATCH `/products/:id`

Same as above, all fields optional, but **at least one** must be present.

### GET `/products/search`

| Field | Rule |
|---|---|
| `q` | optional, max 200 chars |
| `category` | optional, max 120 chars |
| `minPrice` | optional, number ≥ 0 |
| `maxPrice` | optional, number ≥ 0, ≥ minPrice |
| `sortBy` | `price` or `createdAt` only |
| `sortOrder` | `asc` or `desc` only |
| `page` | positive integer |
| `limit` | positive integer, max 100 |

---

## Setup & Run

```bash
# 1. Copy env template
cp services/product-service/.env.example services/product-service/.env

# 2. Edit MONGODB_URI (default: mongodb://127.0.0.1:27017/ecommerce_products)

# 3. Install dependencies (from monorepo root)
npm install

# 4. Start dev server
npm run dev -w services/product-service
```

Service starts on **port 4002** by default.
