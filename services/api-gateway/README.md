# API Gateway

Express-based API Gateway that proxies requests to internal services.

## Routes

- `GET/POST/... /api/users/*` → `USER_SERVICE_URL`
- `GET/POST/... /api/products/*` → `PRODUCT_SERVICE_URL`

## Run

```bash
npm install
npm run dev -w services/api-gateway
```

Health check:
- `GET /health`

