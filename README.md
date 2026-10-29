# URL Shortener

A URL shortener built from scratch as a hands-on way to learn system design. The goal is not just a working app, but understanding *why* each piece exists: caching, async processing, ID generation, and the trade-offs between them.

> **Status:** Phase 1 in progress (scaffolding done, core logic being written by hand).

## Tech Stack

| Layer | Choice |
| --- | --- |
| Backend | NestJS (TypeScript) |
| Database | PostgreSQL 16 + Prisma ORM |
| Cache | Redis 7 (`ioredis`) |
| Queue | BullMQ (Redis-backed) |
| Frontend | React + Vite + TypeScript, TanStack Query, Tailwind |
| Infra | Docker Compose (local Postgres and Redis) |
| Testing | Jest, plus k6 or autocannon for load tests |

## Roadmap

The project is built in phases. Each one is measured before moving on, so every optimization has evidence behind it.

- [ ] **Phase 1: Basic shortener.** `POST /shorten` stores a URL and returns a short code. `GET /:code` looks it up and redirects. Postgres only, no cache. This is the baseline.
- [ ] **Phase 2: Redis cache.** Check Redis before Postgres on redirects, populate on miss with a TTL. Optionally dedupe repeat submissions of the same long URL.
- [ ] **Phase 3: Async click tracking with BullMQ.** Move analytics off the redirect path. Redirects respond immediately and push a job, and a worker writes clicks to Postgres at controlled concurrency.
- [ ] **Phase 4: Hardening.** Rate limiting, link expiry, custom aliases, cleanup job.
- [ ] **Phase 5: Frontend.** A simple form and a links table.
- [ ] **Phase 6: Scaling experiments.** Multiple app instances behind a load balancer, sharding strategy, distributed ID generation.

## Architecture (target)

```
Client ──► NestJS API ──► Redis (cache) ──miss──► PostgreSQL
                │
                └──► BullMQ queue ──► Worker ──► PostgreSQL (click events)
```

The system is heavily read-heavy (many redirects per created link), which drives most of the design decisions.

## Getting Started

### Prerequisites

- Node.js (LTS)
- Docker and Docker Compose
- npm

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL on port `5432` and Redis on port `6379`.

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL="postgresql://shortener:shortener@localhost:5432/shortener"
```

Run migrations and start the dev server:

```bash
npx prisma migrate dev
npm run start:dev
```

The API runs on `http://localhost:3000`.

### 3. Frontend (later phases)

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
url-shortener/
├── backend/            # NestJS API
│   ├── prisma/         # Prisma schema and migrations
│   └── src/
│       ├── prisma/     # Prisma module and service
│       └── url/        # URL module, controller, service
├── frontend/           # React + Vite app
├── docker-compose.yml  # Postgres and Redis
└── README.md
```

## API (planned)

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/shorten` | Accepts a long URL, returns a short code |
| `GET` | `/:code` | Redirects to the original URL |

Request and response shapes will be documented here once Phase 1 is complete.

## Design Decisions

Open questions to resolve and record as the project evolves:

- **Short code generation:** random base62 with collision retry vs. counter-based base62 encoding.
- **Duplicate URLs:** return the existing code, or create a new one each time?
- **Redirect status:** `301` (browser-cached, fewer hits) vs. `302` (every click reaches the server, needed for analytics).
- **Cache policy:** TTL, eviction, and what to do on cache failure.
- **Missing or malformed codes:** what status and response to return.

Decisions and the reasoning behind them will be logged here.

## Performance Notes

Load test results (before and after each phase) will be recorded here, for example redirect latency with and without Redis, and API latency with and without async click tracking.

## License

MIT
