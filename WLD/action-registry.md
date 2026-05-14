# Action Registry

## Actions

### 2026-05-14 — Stage 1 Finalization & GPU Virtualization Strategy

Action:

- Price-focused landing page. E2e verification. Preempt/resume API. Stage 2 GPU virtualization roadmap.

Files/Areas:

- `apps/web/app/welcome.tsx` — hero + timeshare section
- `apps/api/src/routes/workloads.ts` — mode, preempt, resume
- `docs/13-gpu-virtualization-roadmap.md` — 3-phase plan
- `render.yaml` — production with PostgreSQL
- `WLD/current-focus.md`
- `TODO.md`
- `WLD/history.md`
- `docs/06-roadmap-12-weeks.md` — Stage 2 section

Verification:

- Typecheck, 9 tests, production build, e2e (register→workload→invoice).

### 2026-05-13 - Security, Persistence, and Partner-Readiness Fixes

Action:

- Hardened API access, tenant isolation, BYOK persistence, PostgreSQL migration coverage, and auth internals.

Files/Areas:

- `apps/api/src/middleware/auth.ts`
- `apps/api/src/app.ts`
- `apps/api/src/routes/tenant-access.ts`
- `apps/api/src/routes/workloads.ts`
- `apps/api/src/routes/billing.ts`
- `apps/api/src/routes/byok.ts`
- `apps/api/src/routes/provider-bridge.ts`
- `apps/api/src/services/auth.ts`
- `apps/api/src/storage/store.ts`
- `apps/api/src/storage/memory-store.ts`
- `apps/api/src/storage/postgres-store.ts`
- `apps/api/test/security.test.ts`
- `apps/api/test/postgres-migrations.test.ts`
- `apps/web/app/api-client.ts`
- `apps/web/app/page.tsx`
- `infra/postgres/migrations/003_tenant_keys.sql`
- `infra/postgres/migrations/004_relax_provider_references.sql`
- `TODO.md`
- `WLD/current-focus.md`
- `WLD/architecture-snapshot.md`
- `WLD/history.md`
- `WLD/action-registry.md`

Verification:

- `npm.cmd run typecheck`
- `npm.cmd test` - 4 files, 9 tests
- `npm.cmd run build`
- `npm.cmd audit --audit-level=high`

Notes:

- Remaining audit issue is moderate Next/PostCSS and npm suggests unsafe `--force` downgrade.
- Live PostgreSQL server validation remains pending, but SQL migrations now apply in PGlite.

### 2026-05-12 — Cloud-First Positioning

Action:

- Rewrote landing page and dashboard for cloud platform positioning (GPU servers primary). Centralized API_BASE. Full e2e test.

Files/Areas:

- `apps/web/app/welcome.tsx`
- `apps/web/app/page.tsx`
- `apps/web/app/api-client.ts`
- `apps/web/app/auth.tsx`
- `.env.local`

Verification:

- `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build`
- e2e: register → deploy → instances flow works

### 2026-05-12 — Provider Preferences & Routing Control

Action:

- Manual provider override (`provider` param), preferred/blocked lists, tenant preferences API + UI.

Files/Areas:

- `apps/api/src/routes/inference.ts`
- `apps/api/src/services/routing-engine.ts`
- `apps/web/app/page.tsx` (PrefsPanel)

Verification:

- `npm.cmd run typecheck`, `npm.cmd test`

### 2026-05-12 — 1-2-3 Onboarding

Action:

- Landing page with signup, auto API-key, copy-paste code. JWT persistence in localStorage.

Files/Areas:

- `apps/web/app/welcome.tsx`
- `apps/web/app/auth.tsx`
- `apps/web/app/layout.tsx`
- `apps/web/app/page.tsx` (LoginScreen → WelcomePage)
- `apps/api/src/routes/auth.ts` (auto-API-key on register)

Verification:

- Typecheck, tests, production build

### 2026-05-11 — Auth, Rate Limiting, LangChain Endpoint

Action:

- JWT auth system, rate limiting, OpenAI-compatible `/v1/chat/completions`.

Files/Areas:

- `apps/api/src/services/auth.ts`
- `apps/api/src/routes/auth.ts`
- `apps/api/src/routes/inference.ts`
- `apps/api/src/middleware/auth.ts`
- `apps/api/src/middleware/rate-limiter.ts`
- `apps/api/src/app.ts`
- `apps/api/vitest.config.ts`
- `package.json` (jsonwebtoken dep)

Verification:

- Typecheck, tests (with SKIP_AUTH), manual auth flow test

### 2026-05-11 — BYOK

Action:

- Bring Your Own Key: clients add provider keys, workloads route directly.

Files/Areas:

- `apps/api/src/storage/store.ts`
- `apps/api/src/storage/memory-store.ts`
- `apps/api/src/storage/postgres-store.ts`
- `apps/api/src/routes/byok.ts`
- `apps/api/src/routes/workloads.ts`
- `apps/web/app/page.tsx` (KeysPanel + BYOK toggle)
- `apps/web/app/api-client.ts`

Verification:

- Full e2e: register → add AWS key → BYOK workload → confirmed

### 2026-05-10 — Full Integration Sprint

Action:

- 40 provider adapters, Thunder Compute integration, dashboard, billing, benchmark, GPU normalization, deployment config.

Files/Areas:

- `apps/api/src/providers/adapter.ts`
- `apps/api/src/providers/thunder-compute.ts`
- `apps/api/src/providers/all-adapters.ts`
- `apps/api/src/providers/inference-adapters.ts`
- `apps/api/src/providers/registry.ts`
- `apps/api/src/services/routing-engine.ts`
- `apps/api/src/services/gpu-normalizer.ts`
- `apps/api/src/services/billing-engine.ts`
- `apps/api/src/services/benchmark.ts`
- `apps/api/src/routes/provider-bridge.ts`
- `apps/api/src/routes/billing.ts`
- `apps/api/src/routes/benchmark.ts`
- `apps/web/app/page.tsx`
- `apps/web/app/api-client.ts`
- `apps/web/app/styles.css`
- `packages/common/src/index.ts`
- `Dockerfile`, `docker-compose.yml`
- `.git/`, `.env.example`

Verification:

- Typecheck, tests, production build, benchmark API working (14 GPU profiles, 19 providers per profile)

### 2026-05-10 — WLD Capsule

Action: Created WLD recovery capsule folder (7 files).

### 2026-05-03 — PostgreSQL Layer

Action: `EraStore` interface, `PostgresStore`, migration runner.

### 2026-05-02 — Routing

Action: Routing engine, workload lifecycle.

### 2026-04-23 — Monorepo

Action: Bootstrap npm workspace monorepo.

### 2026-03-29 — Spec

Action: Product and architecture documentation.
