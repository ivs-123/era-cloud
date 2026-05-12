# Architecture Snapshot

## Repository Shape

```text
apps/
  api/           Fastify backend API (19 endpoints)
    src/
      config.ts
      app.ts        bootstrap + route registration
      server.ts     entry point
      providers/    adapter interface, Thunder Compute, all 40 adapters
      routes/       health, auth, tenants, providers, routing, workloads,
                    provider-bridge, billing, benchmark, byok, inference
      services/     routing-engine, billing-engine, benchmark, auth,
                    gpu-normalizer
      storage/      EraStore interface, MemoryStore, PostgresStore
      middleware/    auth (JWT), rate-limiter
      scripts/      migrate.ts
    test/
    vitest.config.ts
  web/           Next.js dashboard (8 tabs)
    app/
      layout.tsx   AuthProvider wrapper
      page.tsx     Dashboard (tabs: Servers, Providers, Workloads, Tenants,
                   Billing, Benchmark, Keys, Preferences)
      welcome.tsx  Landing page + onboarding
      auth.tsx     JWT context provider
      api-client.ts  Typed API client with API_BASE config
      styles.css
packages/
  common/        shared TypeScript types (SUPPORTED_PROVIDERS, contracts)
infra/
  postgres/
    migrations/  001_initial.sql, 002_billing.sql
docs/           12 documents (MVP, architecture, API, data model, routing,
                roadmap, storage, deployment, partnership, business canvas,
                deployment guide, provider checklist)
WLD/            recovery capsule (7 files)
```

## Runtime Components

- API: Fastify, TypeScript, Node.js 22+
- Web: Next.js 16 (Turbopack)
- Shared types: `@era/common`
- Persistence: memory (dev) + postgres (compiles, untested)
- Auth: JWT (jsonwebtoken), rate limiting (in-memory)
- Database: PostgreSQL (migrations ready, not validated)
- Local DB: Docker Compose (Docker unavailable on Windows)

## API Surface (19 endpoints)

- `GET /health`
- `POST /api/v1/auth/register` — returns JWT + API key
- `POST /api/v1/auth/login` — returns JWT
- `GET /api/v1/auth/me` — current user
- `POST /api/v1/auth/api-keys` — generate dev API key
- `GET /api/v1/auth/api-keys` — list keys
- `GET /api/v1/tenants`
- `POST /api/v1/tenants`
- `PUT /api/v1/tenants/preferences` — provider prefs
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
- `POST /api/v1/keys` — BYOK
- `GET /api/v1/keys`
- `DELETE /api/v1/keys/:id`
- `POST /v1/chat/completions` — OpenAI-compatible
- `GET /v1/models`

## Providers (40 total, 4 layers)

| Layer | Providers | Count |
|-------|-----------|-------|
| GPU Cloud | Thunder, Hetzner, RunPod, Lambda, Vultr, DO, Linode, Vast.ai, FluidStack, MassedCompute, OVHcloud, AWS, GCP, Azure, Oracle, IBM, Alibaba, Tencent, Huawei, Baidu, Yandex, VK Cloud, SberCloud, Cloud.ru, Selectel | 24 |
| Inference API | DeepInfra, Together, Groq, Lepton, Cerebras, SambaNova, OpenAI, Anthropic, Fireworks, DeepL, AssemblyAI | 11 |
| Edge/CDN | Cloudflare, Akamai, Fastly | 3 |
| Marketplace | GitHub, Vercel | 2 |

## Domain Architecture

- `eracloud.pro` — registered, Cloudflare DNS
- Planned: `app.eracloud.pro`, `api.eracloud.pro`, `docs.eracloud.pro`
- Brand decision pending: `eracloud.pro` vs `eraone` ecosystem

## Key Architectural Patterns

- **Provider Adapter:** unified interface → 40 implementations
- **GPU Normalization:** canonical profile names (h100-80gb, a100-80gb) → cross-provider matching
- **Routing Engine:** cheapest/balanced/low-latency + preferred/blocked providers
- **BYOK:** client brings own keys → direct routing, fixed SaaS fee
- **Auth:** JWT (24h) + API keys (era_... prefix) + rate limiting (600/min)

## Verification Commands

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
$env:SKIP_AUTH="true"; npm.cmd test  # for auth-gated tests
```
