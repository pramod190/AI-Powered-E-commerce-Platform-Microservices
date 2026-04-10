# Payment Service — `@services/payment-service`

> Node.js · Express · TypeScript · Stripe · Clean Architecture

---

## Features

| Capability | Detail |
|---|---|
| Create Payment Intent | Generate Stripe payment intents from orders |
| Webhook Handling | Process Stripe webhook events (success, failure) |
| Order Integration | Automatically update order status after payment |
| Payment Tracking | In-memory tracking (production: use PostgreSQL) |
| Error Handling | Comprehensive error handling + logging |
| Security | Webhook signature verification (configured) |
| Idempotency | Duplicate payment detection |

---

## Payment Flow

```
1. Frontend (React) 
   ↓ POST /payments/intent
2. Payment Service
   ├─→ Verify Order exists (Order Service)
   ├─→ Create Stripe Payment Intent
   ├─→ Store payment record
   └─→ Return {paymentIntentId, clientSecret}
   ↓
3. Frontend uses clientSecret
   ├─→ Stripe.js loads card form
   ├─→ User enters payment details  
   ├─→ User clicks "Pay"
   └─→ Submits to Stripe
   ↓
4. Stripe processes payment
   ├─→ If successful: charge card
   ├─→ Send webhook: payment_intent.succeeded
   ↓
5. Payment Service (webhook handler)
   ├─→ Verify webhook signature
   ├─→ Update payment record (SUCCEEDED)
   ├─→ Call Order Service: update status to PAID
   └─→ Trigger downstream events (Kafka)
```

---

## API Reference

### Create Payment Intent

```bash
POST /payments/intent
Content-Type: application/json

{
  "orderId": "ord-123",
  "customerEmail": "user@example.com",    # Optional
  "customerName": "John Doe"              # Optional
}

Response: 201 Created
{
  "payment": {
    "id": "pay-uuid",
    "orderId": "ord-123",
    "userId": "user123",
    "amount": 1999.98,
    "status": "PENDING",
    "paymentIntentId": "pi_xxx",
    "clientSecret": "pi_xxx_secret_yyy"  # Use in frontend
  }
}
```

### Webhook Handler

```
POST /webhooks/stripe
Headers: stripe-signature: t=...,v1=...

Payload (auto-verified):
{
  "type": "payment_intent.succeeded|payment_intent.payment_failed",
  "data": {
    "object": {
      "id": "pi_xxx",
      "status": "succeeded|requires_payment_method",
      "amount": 199998,
      "metadata": {
        "orderId": "ord-123",
        "userId": "user123"
      }
    }
  }
}

Response: 200 OK
{ "received": true }
```

---

## Frontend Integration (React)

```typescript
// 1. Create payment intent
const response = await axios.post('http://localhost:4005/payments/intent', {
  orderId: 'ord-123',
  customerEmail: 'user@example.com'
});

const { clientSecret } = response.data.payment;

// 2. Confirm payment with Stripe.js
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const fn = async () => {
  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: { email: 'user@example.com' }
    }
  });

  if (paymentIntent.status === 'succeeded') {
    // Show success
  } else {
    // Show error
  }
};
```

---

## Payment Status Workflow

```
PENDING
  ├→ PROCESSING (user in payment flow)
  ├→ SUCCEEDED (payment confirmed)
  ├→ FAILED (declined or error)
  └→ CANCELLED (user cancelled)
  
REFUNDED (refund issued later)
```

---

## Stripe Setup

### 1. Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create account (free)
3. Copy **Secret Key** (sk_test_...)
4. Copy **Publishable Key** (pk_test_...)
5. Create Webhook Endpoint:
   - URL: `https://yourapi.com/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy **Signing Secret** (whsec_...)

### 2. Configure .env

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
```

### 3. Local Testing with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:4005/webhooks/stripe

# Get forwarding signing secret
# Use in .env as STRIPE_WEBHOOK_SECRET
```

---

## Production Considerations

### 1. Webhook Signature Verification

```typescript
// Implement in middleware
import Stripe from 'stripe';

const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  env.STRIPE_WEBHOOK_SECRET
);
```

### 2. Database Persistence

Replace `InMemoryPaymentRepository` with:

```typescript
// PostgreSQL schema
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  order_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  amount DECIMAL(10,2),
  status ENUM(...),
  payment_intent_id VARCHAR UNIQUE,
  stripe_customer_id VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

// Indexes
CREATE INDEX payments_order_id ON payments(order_id);
CREATE INDEX payments_user_id ON payments(user_id);
CREATE INDEX payments_intent_id ON payments(payment_intent_id);
```

### 3. Error Handling

```typescript
- Retry failed webhooks (exponential backoff)
- Log all payment errors for audit
- Use idempotency keys for duplicate prevention
- Alert on failed payments
```

### 4. Security

- Never expose SECRET_KEY to frontend
- Always verify webhook signatures
- Use HTTPS in production
- Store PCI-compliant (use Stripe, don't store cards)
- Implement rate limiting on webhook endpoint

---

## Configuration

```bash
# Server
SERVICE_NAME=payment-service
PORT=4005
LOG_LEVEL=info
CORS_ORIGINS=http://localhost:5173

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Services
ORDER_SERVICE_URL=http://localhost:4004

# Currency
CURRENCY=usd
```

---

## How to Run

1. **Setup Stripe Account:**
   - Sign up at https://stripe.com
   - Get test API keys

2. **Configure .env with Stripe keys**

3. **Install dependencies:**
   ```bash
   npm install -w services/payment-service
   ```

4. **Start service:**
   ```bash
   npm run dev -w services/payment-service
   ```

5. **For webhook testing:**
   ```bash
   stripe listen --forward-to localhost:4005/webhooks/stripe
   ```

6. **Test payment creation:**
   ```bash
   curl -X POST http://localhost:4005/payments/intent \
     -H "Content-Type: application/json" \
     -d '{"orderId": "test-order-123"}'
   ```

---

## Next Steps

1. ✅ Implement PostgreSQL persistence
2. ✅ Add idempotency keys
3. ✅ Implement webhook signature verification
4. ✅ Add payment retry logic
5. ✅ Integrate with Kafka (Task 12)
6. ✅ Add payment refund handling
7. ✅ Implement 3D Secure (Strong Customer Authentication)
