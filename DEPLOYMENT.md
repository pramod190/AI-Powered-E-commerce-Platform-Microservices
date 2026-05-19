# 🚀 Deployment Guide — ShopHub

> Both the product service and frontend build **100% clean** (verified).  
> Follow this guide to go live in ~30 minutes.

---

## ✅ Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas account ready
- [ ] Render.com account ready  
- [ ] Vercel account ready

---

## Step 1 — Push Code to GitHub

```bash
git add .
git commit -m "feat: add deployment configs"
git push origin main
```

---

## Step 2 — MongoDB Atlas (Free 512MB)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a **free M0 cluster**
3. Click **Connect → Drivers** → copy the connection string
4. Replace `<password>` with your DB user password
5. Save it — you'll need it for Render:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ecommerce_products
```

---

## Step 3 — Deploy Product Service on Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Set these settings:

| Setting | Value |
|---|---|
| **Name** | `shophub-product-service` |
| **Root Directory** | `services/product-service` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `node dist/server.js` |

4. Add **Environment Variables**:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | *(paste Atlas URI from Step 2)* |
| `CORS_ORIGINS` | *(paste your Vercel URL after Step 4)* |

5. Click **Deploy** → wait ~3 min → copy the service URL:
```
https://shophub-product-service.onrender.com
```

6. **Seed the database** (one-time, run locally):
```bash
cd services/product-service
MONGODB_URI="mongodb+srv://..." npm run seed
```

---

## Step 4 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add **Environment Variables**:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://shophub-product-service.onrender.com` |
| `VITE_USER_SERVICE_URL` | *(Render user service URL if deployed)* |
| `VITE_CART_SERVICE_URL` | *(Render cart service URL if deployed)* |
| `VITE_ORDER_SERVICE_URL` | *(Render order service URL if deployed)* |
| `VITE_PAYMENT_SERVICE_URL` | *(Render payment service URL if deployed)* |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_test_...` *(from Stripe dashboard)* |

5. Click **Deploy** → get your live URL:
```
https://shophub-xyz.vercel.app
```

6. Go back to Render → update `CORS_ORIGINS` on the product service with this URL → **Redeploy**

---

## Step 5 — (Optional) Deploy Other Services

### PostgreSQL — Supabase (Free)
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy the **Connection String** from Settings → Database
3. Use it as `DATABASE_URL` for user-service and order-service

### Redis — Upstash (Free)
1. Go to [upstash.com](https://upstash.com) → Create Redis database
2. Copy `UPSTASH_REDIS_REST_URL` and token
3. Set `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` on cart-service

### RabbitMQ — CloudAMQP (Free)
1. Go to [cloudamqp.com](https://www.cloudamqp.com) → Create instance (Little Lemur — free)
2. Copy the **AMQP URL**
3. Set `RABBITMQ_URL` on order, payment, and analytics services

---

## 🔗 Final URLs (after full deployment)

| Service | URL |
|---|---|
| Frontend | `https://shophub-xyz.vercel.app` |
| Product API | `https://shophub-product-service.onrender.com` |
| User API | `https://shophub-user-service.onrender.com` |
| Cart API | `https://shophub-cart-service.onrender.com` |
| Order API | `https://shophub-order-service.onrender.com` |
| Payment API | `https://shophub-payment-service.onrender.com` |

---

## ⚠️ Render Free Tier Note

On the **free tier**, Render services **spin down after 15 min of inactivity** and take ~30s to wake up on the next request. To avoid this:
- Upgrade to the **$7/month Starter** plan, OR
- Use [UptimeRobot](https://uptimerobot.com) (free) to ping your services every 10 min

---

## ✅ Verify Deployment

```bash
# Check product service is live
curl https://shophub-product-service.onrender.com/health

# Expected response:
# { "status": "ok", "service": "product-service", "mongo": 1 }

# Check products are returning
curl https://shophub-product-service.onrender.com/products
```
