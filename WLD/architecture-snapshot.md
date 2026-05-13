# Architecture Snapshot

## Repository Shape

```text
apps/
  api/           Fastify backend API
    src/
      config.ts
      app.ts
      server.ts
      providers/
      routes/
      services/
      storage/
      middleware/
      scripts/
    test/
    vitest.config.ts
  web/           Next.js dashboard and landing/onboarding
    app/
      layout.tsx
      page.tsx
      welcome.tsx
      auth.tsx
      api-client.ts
      styles.css
packages/
  common/        shared TypeScript contracts
infra/
  postgres/
    migrations/
docs/
WLD/
```

## Runtime Components

- API: Fastify, TypeScript, Node.js 22+
- Web: Next.js 16 static export for GitHub Pages
- Shared types: `@era/common`
- Persistence: memory mode for tests/dev, PostgreSQL mode for production
- Auth: JWT, scrypt password hashing in memory-mode auth MVP, API keys with SHA-256 internal hashes
- Rate limiting: in-memory, 600 requests/minute
- Database: PostgreSQL migrations validated with PGlite; live PostgreSQL runtime pending
- Local DB option: Docker Compose

## API Surface

- `GET /health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/api-keys`
- `GET /api/v1/auth/api-keys`
- `GET /api/v1/tenants`
- `POST /api/v1/tenants`
- `PUT /api/v1/tenants/preferences`
- `GET /api/v1/tenants/preferences`
- `GET /api/v1/providers`
- `POST /api/v1/admin/providers`
- `POST /api/v1/providers/:name/sync`
- `GET /api/v1/providers/:name/instances`
- `POST /api/v1/providers/:name/instances`
- `POST /api/v1/providers/:name/instances/:id/stop`
- `POST /api/v1/routing/simulate`
- `GET /api/v1/workloads`
- `GET /api/v1/workloads/:id`
- `POST /api/v1/workloads`
- `POST /api/v1/workloads/:id/stop`
- `POST /api/v1/usage/events`
- `GET /api/v1/usage`
- `GET /api/v1/billing/estimate`
- `GET /api/v1/billing/invoices`
- `POST /api/v1/billing/invoices/generate`
- `GET /api/v1/benchmark/gpu`
- `POST /api/v1/keys`
- `GET /api/v1/keys`
- `DELETE /api/v1/keys/:id`
- `POST /v1/chat/completions`
- `GET /v1/models`

## Security Posture

- Operational routes require Bearer JWT by default.
- Public routes: health, register, login, GPU benchmark.
- Workloads, billing, BYOK, and provider instance creation enforce tenant match.
- Frontend sends JWT from `localStorage` via `authHeaders()`.
- Tests include unauthenticated route rejection and cross-tenant billing rejection.

## Providers

Provider adapter architecture exists with a unified interface and registry.

Provider categories:

- GPU cloud providers
- Inference API providers
- Edge/CDN providers
- Marketplace providers

Current caveat:

- Most adapters are stubs until real provider credentials, product terms, and API-specific provisioning flows are connected.

## Domain Architecture

- `eracloud.pro`: registered, Cloudflare DNS
- Planned: `app.eracloud.pro`, `api.eracloud.pro`, `docs.eracloud.pro`, `status.eracloud.pro`
- Brand decision pending: `eracloud.pro` vs `eraone` ecosystem umbrella

## Key Architectural Patterns

- Provider adapter: unified interface with provider-specific implementations
- GPU normalization: canonical GPU profile names for cross-provider matching
- Routing engine: cheapest, balanced, low-latency, preferred, blocked
- BYOK: tenant-owned provider keys, currently storing only prefixes in app storage
- Billing: usage events, projected spend, invoice generation

## Verification Commands

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd audit --audit-level=high
```

Current automated coverage:

- 4 API test files
- 9 tests
- SQL migration validation via PGlite
