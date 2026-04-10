# Scalable AI E-Commerce Platform (Microservices)

Monorepo for an AI-powered e-commerce platform with microservices.

## Services

- `services/api-gateway` (Node.js + Express + TypeScript)
- `services/user-service` (Node.js + Express + TypeScript)
- `services/product-service` (Node.js + Express + TypeScript)
- `services/cart-service` (Node.js + Express + TypeScript)
- `services/order-service` (Node.js + Express + TypeScript)
- `services/payment-service` (Node.js + Express + TypeScript)
- `services/recommendation-service` (Node.js + Express + TypeScript)
- `services/ml-service` (Python + FastAPI)
- `frontend` (React + TypeScript)

## Quickstart (local dev)

Prereqs:
- Node.js 20+
- Python 3.11+ (for `ml-service`)
- Docker Desktop (optional, for databases/Kafka)

Install JS dependencies:

```bash
npm install
```

Start infrastructure (optional):

```bash
docker compose up -d
```

Run a service:

```bash
npm run dev -w services/user-service
```

Run the frontend:

```bash
npm run dev -w frontend
```

Run ML service:

```bash
cd services/ml-service
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

