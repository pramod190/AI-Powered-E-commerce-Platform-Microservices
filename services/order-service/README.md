# Order Service — `@services/order-service`

> Node.js · Express · TypeScript · PostgreSQL · Prisma · Clean Architecture

---

## Features

| Capability | Detail |
|---|---|
| Create Orders | Convert cart to order, clear cart |
| Order Management | View orders by ID or user |
| Order Status | Track order lifecycle (pending → delivered) |
| Order Items | Preserve pricing snapshot at order time |
| Validation | Zod schemas on all requests |
| Error handling | Centralised `AppError` + typed middleware |
| Database | PostgreSQL with Prisma ORM |
| Relationships | Proper foreign keys and constraints |

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  status ENUM ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'),
  total DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items (line items)
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  product_id VARCHAR NOT NULL,
  quantity INT,
  price DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE (order_id, product_id)
);

-- Indexes
CREATE INDEX orders_user_id ON orders(user_id);
CREATE INDEX orders_status ON orders(status);
CREATE INDEX orders_created_at ON orders(created_at);
CREATE INDEX order_items_order_id ON order_items(order_id);
CREATE INDEX order_items_user_id ON order_items(user_id);
CREATE INDEX order_items_product_id ON order_items(product_id);
```

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `POST` | `/orders` | Create order from cart |
| `GET` | `/orders` | Get user's orders |
| `GET` | `/orders/:id` | Get order by ID |
| `PATCH` | `/orders/:id/status` | Update order status |
| `GET` | `/health` | Health check |

---

## Examples

### Create Order (from Cart)
```bash
POST /orders
Headers: x-user-id: user123

Response: 201 Created
{
  "order": {
    "id": "ord-123",
    "userId": "user123",
    "status": "PENDING",
    "items": [
      {
        "productId": "prod-123",
        "quantity": 2,
        "price": 999.99,
        "subtotal": 1999.98
      }
    ],
    "total": 1999.98,
    "createdAt": "2026-04-10T12:00:00Z",
    "updatedAt": "2026-04-10T12:00:00Z"
  }
}
```

### Get User's Orders
```bash
GET /orders
Headers: x-user-id: user123

Response:
{
  "orders": [
    { ...order1 },
    { ...order2 }
  ]
}
```

### Update Order Status
```bash
PATCH /orders/ord-123/status
Content-Type: application/json

{
  "status": "SHIPPED"
}

Response: 200 OK
{ "order": { ...updated order } }
```

---

## Order Status Workflow

```
PENDING → PAID → PROCESSING → SHIPPED → DELIVERED
   ↓
CANCELLED (can happen at any stage)
```

---

## How to Run

1. **Setup PostgreSQL:**
   ```bash
   # Install PostgreSQL or use Docker
   docker run -d -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15
   
   # Create database
   createdb ecommerce_orders
   ```

2. **Setup Prisma:**
   ```bash
   npm install -w services/order-service
   npx prisma db push -w services/order-service
   ```

3. **Start service:**
   ```bash
   npm run dev -w services/order-service
   ```

---

## Configuration

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_orders
PRODUCT_SERVICE_URL=http://localhost:4002
CART_SERVICE_URL=http://localhost:4003
PAYMENT_SERVICE_URL=http://localhost:4005
```

---

## Next Steps

- ✅ Integrate with Payment Service (Task 11)
- ✅ Add Kafka events (Task 12)
- ✅ Order analytics dashboard
