# Architecture Snapshot

## Repository Shape

```text
apps/
  api/      Fastify backend API
  web/      Next.js dashboard shell
packages/
  common/   shared TypeScript types
infra/
  postgres/
    migrations/
docs/       product, architecture, API, deployment docs
WLD/        recovery capsule
```

## Runtime Components

- API: Fastify, TypeScript, Node.js
- Web: Next.js
- Shared contracts: `@era/common`
- Persistence modes: `memory` and `postgres`
- Database: PostgreSQL
- Local DB option: Docker Compose

## API Surface Implemented

- `GET /health`
- `GET /api/v1/tenants`
- `POST /api/v1/tenants`
- `GET /api/v1/providers`
- `POST /api/v1/admin/providers`
- `POST /api/v1/routing/simulate`
- `GET /api/v1/workloads`
- `GET /api/v1/workloads/:id`
- `POST /api/v1/workloads`
- `POST /api/v1/workloads/:id/stop`

## Important Backend Files

- `apps/api/src/app.ts`: app bootstrap and route registration
- `apps/api/src/config.ts`: runtime config
- `apps/api/src/storage/store.ts`: storage interface
- `apps/api/src/storage/memory-store.ts`: default in-memory store
- `apps/api/src/storage/postgres-store.ts`: PostgreSQL store
- `apps/api/src/storage/index.ts`: store factory
- `apps/api/src/services/routing-engine.ts`: routing algorithm
- `apps/api/src/routes/*.ts`: HTTP routes
- `apps/api/src/scripts/migrate.ts`: SQL migration runner

## Important Frontend Files

- `apps/web/app/page.tsx`: dashboard shell
- `apps/web/app/styles.css`: dashboard styling
- `apps/web/app/layout.tsx`: app metadata/layout

## Database Migrations

- `infra/postgres/migrations/001_initial.sql`
- `infra/postgres/migrations/002_billing.sql`

## Domain Architecture

Registered domain:

- `eracloud.pro`

DNS provider:

- Cloudflare

Planned hostnames:

- `eracloud.pro`: public website
- `www.eracloud.pro`: website alias
- `app.eracloud.pro`: customer control panel
- `api.eracloud.pro`: backend API
- `docs.eracloud.pro`: docs later
- `status.eracloud.pro`: status page later

## Routing Policies

- `cheapest`: cost-first routing
- `balanced`: default blend of cost, latency, availability
- `low-latency`: latency-first routing

## Verification Commands

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

