# User Service (PostgreSQL + Prisma)

## Data model

- `User`: `id`, `name`, `email`, `password`, `createdAt`

## Auth APIs

- `POST /auth/register`
- `POST /auth/login`

## Setup

Create `services/user-service/.env` from `.env.example` and ensure Postgres is running (see repo `docker-compose.yml`).

Install deps:

```bash
npm install
```

Generate Prisma client:

```bash
npm run prisma:generate -w services/user-service
```

Create and apply migration (dev):

```bash
npm run prisma:migrate -w services/user-service -- --name init
```

Apply migrations in production (CI/CD):

```bash
npm run prisma:deploy -w services/user-service
```

Run service:

```bash
npm run dev -w services/user-service
```

Health:
- `GET /health`

