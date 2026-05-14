# Work History

## 2026-05-14 — Stage 1 Completion: e2e Verified, GPU Virtualization Roadmap

Focus:

- Verify full e2e flow. Plan Stage 2 (own GPU virtualization).

Completed:

- E2e test: register → sync 6 providers → H100 workload on Vast.ai ($1.30/h) → invoice $5.46 ✅
- Landing page: price-focused hero ("Same GPU. 5x cheaper. H100 from $1.30/h").
- Timeshare section: "Why our prices are low" — explains GPU timeshare vs traditional rental.
- Preempt/resume API: `POST /v1/workloads/:id/preempt`, `POST /v1/workloads/:id/resume`.
- Prototyping mode in workload creation (`mode: "prototyping"` → preemptible, 50% cheaper).
- GPU virtualization roadmap: `docs/13-gpu-virtualization-roadmap.md` — 3 phases, from rented metal to own TCP protocol.
- Render blueprint updated: includes PostgreSQL service + PGLite fallback.
- GitHub Pages domain: `eracloud.pro` CNAME set, awaiting Cloudflare DNS.
- WLD + TODO comprehensive update: marked audit items complete, Stage 2 roadmap.

Verification:

- Typecheck, tests (9/9), production build — all pass.
- GitHub Actions: auto-deploy succeeds.
- E2e: register → workload → invoice workflow verified.

Blockers:

- Cloudflare DNS CNAME not configured.
- Render API not deployed (one-click URL ready).
- No real provider tokens (except Thunder Compute).

Next action:

- Add Cloudflare DNS CNAME record.
- Click "Deploy to Render" for API + PostgreSQL.

## 2026-05-13 - Security, Persistence, and Partner-Readiness Fixes

Focus:

- Study WLD and TODO, then close high-priority blockers before provider onboarding and partner discussions.

Completed:

- Tightened auth middleware so operational API routes require Bearer JWT by default.
- Reordered auth before rate limiting so tenant-aware rate limiting can work for authenticated requests.
- Added frontend JWT propagation via `authHeaders()` and patched direct dashboard fetch calls.
- Added tenant isolation checks for workloads, billing, BYOK, and provider instance creation.
- Added security tests for unauthenticated access and cross-tenant billing rejection.
- Added PostgreSQL tenant key migration and PostgresStore BYOK persistence.
- Fixed Postgres invoice generation by inserting billing periods in the invoice transaction.
- Added migration to relax provider FK constraints for BYOK and external provider instance identifiers.
- Added PGlite migration validation test.
- Replaced plaintext password storage with scrypt password hashes in the memory auth MVP.
- Replaced weak API key hashing with SHA-256.
- Ran `npm audit fix`; high severity findings were fixed.
- Updated TODO and WLD to reflect current state.

Verification:

- `npm.cmd run typecheck` passed.
- `npm.cmd test` passed: 4 files, 9 tests.
- `npm.cmd run build` passed.
- `npm.cmd audit --audit-level=high` no longer reports high severity blockers; remaining issue is moderate Next/PostCSS that requires unsafe force downgrade.

Blockers:

- Live PostgreSQL runtime still needs validation against Docker, Neon, Supabase, or Render PostgreSQL.
- Auth users and generated API keys are still in-memory; suitable for demo, not production accounts.
- Provider adapters beyond Thunder remain stubs until real API credentials and provider-specific contracts are added.

Next action:

- Deploy API to Render with a strong `JWT_SECRET`, connect Cloudflare DNS, and validate live PostgreSQL persistence before onboarding real customers.

## 2026-05-13 — Deployment Sprint

Focus:

- Ship ERA Cloud to production. GitHub repo, CI/CD pipeline, public site, custom domain.

Completed:

- GitHub repo: `ivs-123/era-cloud` (public). Pushed 28 commits.
- GitHub Actions: `deploy.yml` — auto-deploy to GitHub Pages on every push.
- Frontend live: `https://ivs-123.github.io/era-cloud/` — 200 OK.
- Next.js static export (`output: "export"`) for GitHub Pages compatibility.
- Custom domain `eracloud.pro` configured in GitHub Pages (needs Cloudflare CNAME).
- CNAME file auto-added to Pages deployment artifact.
- `render.yaml` blueprint for one-click API deploy on Render.
- `railway.json` + `vercel.json` deployment configs for alternatives.
- Landing page: "Already on AWS? Save 30-50% without switching" (BYOK/Hybrid/Cost Dashboard).
- Getting Started wizard in dashboard for new users.
- Live pricing on landing page from benchmark API.
- Comprehensive `TODO.md` — 60+ items across immediate/short-term/medium-term.
- WLD updated: current-focus + TODO + architecture snapshot.

Verification:

- Typecheck, tests (5/5), production build — all pass.
- GitHub Actions: 4 successful deploys, 1 initial failure.
- Site verified: 200 OK, proper HTML + JS + CSS delivery.

Blockers:

- API backend not deployed — needs Render account.
- Cloudflare DNS CNAME not set — `eracloud.pro` → `ivs-123.github.io`.
- No real provider API tokens (except Thunder Compute).

Next action:

- Add Cloudflare CNAME record.
- Click "Deploy to Render" for API.

## 2026-05-12 — Cloud-First Positioning

Focus:

- Reposition ERA Cloud as a cloud platform (GPU servers primary), not just an inference gateway.
- Make the product actually runnable end-to-end.

Completed:

- Landing page rewritten: "GPU servers, any provider, one click" — H100 from $1.30/h, A100 from $0.55/h.
- Dashboard: default tab = Servers (was Workloads), "Deploy Server" button with GPU picker.
- Onboarding: post-signup shows server deployment code, not just inference.
- Centralized API_BASE config — zero hardcoded `localhost:4000` in frontend.
- `.env.local` for dev environment.
- Full e2e tested: register → API key → sync providers → deploy workload → check instances.

Verification:

- `npm.cmd run typecheck` passed.
- `npm.cmd test` passed with 5 tests.
- `npm.cmd run build` passed (API + Next.js production).
- API on `:4000`, Web on `:3000`, register → deploy flow works.

Blockers:

- No real API tokens for any provider except Thunder Compute.
- PostgreSQL not validated (DLL error on Windows).

Next action:

- Register live accounts on DeepInfra, Groq, Together AI, Vast.ai, RunPod.
- Test real inference routing and GPU server provisioning.

## 2026-05-12 — Provider Preferences & Routing Control

Focus:

- Add manual provider selection alongside auto-routing.

Completed:

- `/v1/chat/completions` accepts `provider` param for manual override.
- `preferred_providers` / `blocked_providers` arrays for auto-routing preferences.
- Routing engine: preferred providers get +0.3 score boost; blocked are filtered out.
- Tenant preferences API: `PUT/GET /api/v1/tenants/preferences`.
- Preferences UI: checkbox lists for preferred/blocked providers.
- 4 routing modes: Auto (cheapest), Auto + Preferred, Manual override, Blocked.

Verification:

- `npm.cmd run typecheck` passed.
- `npm.cmd test` passed with 5 tests.

## 2026-05-12 — 1-2-3 Onboarding Flow

Focus:

- Make onboarding dead simple: sign up → copy code → deployed.

Completed:

- Landing page with 1-2-3 steps and feature cards.
- API key auto-generated on registration (returned in response).
- Post-signup onboarding screen with copy-paste code example.
- JWT auth context (`AuthProvider`) wraps entire app.
- Login/register screen → automatic redirect to dashboard.

Verification:

- Typecheck, tests, production build passed.

## 2026-05-11 — Auth, Rate Limiting, LangChain Endpoint

Focus:

- Add authentication, security, and OpenAI-compatible API endpoint.

Completed:

- JWT auth: register/login/me/api-keys endpoints.
- `POST /v1/chat/completions` — OpenAI-compatible, drop-in replacement.
- `GET /v1/models` — list all available models with provider info.
- Rate limiting: 600 req/min per tenant, `Retry-After` header.
- Auth middleware: all routes protected except health/auth/benchmark.
- `SKIP_AUTH=true` for dev/test mode.
- Vitest config with auto SKIP_AUTH.

Verification:

- `npm.cmd run typecheck` passed.
- `npm.cmd test` passed with 5 tests.

## 2026-05-11 — BYOK (Bring Your Own Key)

Focus:

- Enterprise feature: clients use their own provider API keys through ERA Cloud.

Completed:

- TenantKey model: store, add, list, remove keys.
- BYOK API: `POST/GET/DELETE /api/v1/keys`.
- Workload creation: `tenant_key_id` param — routes to `byok_<key_id>`.
- BYOK routing reason: `byok_direct_route`.
- Keys management UI with add/remove, key prefix display (never full key).
- BYOK toggle in Create Workload form.

Verification:

- Full e2e: register → add AWS key → create BYOK workload → confirmed `byok_direct_route`.

## 2026-05-10 — Provider Integration, Dashboard, Billing, 40 Adapters

Focus:

- Full-stack sprint: 40 provider adapters, Thunder Compute integration, interactive dashboard, billing engine, GPU benchmark, deployment config.

Completed:

- Git repository initialized (19 commits total as of 2026-05-12).
- Provider adapter framework with `ProviderAdapter` interface.
- Thunder Compute adapter with real HTTP client to `api.thundercompute.com:8443/v1`.
- 40 adapters: 24 GPU cloud, 11 inference APIs, 3 edge/CDN, 2 marketplaces.
- GPU profile normalization: cross-provider H100/A100 matching.
- Interactive Next.js dashboard with 8 tabs.
- Billing engine: usage events, projected spend, invoice generation.
- GPU benchmark API: 14 canonical profiles, 19-provider price comparison.
- Dockerfile + docker-compose + deployment guide for `eracloud.pro`.
- Provider registration checklist (21 providers in 6 tiers).
- Partnership strategy and business canvas docs.

Verification:

- `npm.cmd run typecheck` passed.
- `npm.cmd test` passed with 5 tests.
- `npm.cmd run build` passed (API + Next.js production).

Blockers:

- PostgreSQL not validated (DLL init error on Windows). PostgresStore compiles but untested.
- No real provider API tokens except Thunder Compute.
- Planned adapters are stubs — need real API credentials.

## 2026-05-10 — WLD Folder Capsule

Focus:

- Convert the single WLD file into a full recovery capsule.

Completed:

- Created `WLD/` folder with 7 files.
- Preserved prior work history from `worklogdoc.md`.

## 2026-05-08 — WLD Created

Focus:

- Create persistent project work journal.

## 2026-05-03 — Domain and Local PostgreSQL Infrastructure

Focus:

- Prepare project for `eracloud.pro` and persistent local development.

Completed:

- `docker-compose.yml`, billing migration, Cloudflare/domain docs.

## 2026-05-03 — PostgreSQL Repository Layer

Focus:

- Decouple routes from in-memory storage.

Completed:

- `EraStore` interface, `PostgresStore`, migration runner, store factory.

## 2026-05-02 — Routing and Workload Lifecycle

Focus:

- Make ERA Cloud route workloads to providers.

Completed:

- Routing engine (cheapest/balanced/low-latency), workload CRUD, provider capabilities.

## 2026-04-23 — Monorepo and First API/Web Skeleton

Focus:

- Turn product docs into a runnable project.

Completed:

- npm workspace monorepo, Fastify API, Next.js dashboard, first migration.

## 2026-03-29 — Product and Architecture Specification

Focus:

- Define ERA Cloud MVP as a broker/control-plane.

Completed:

- README + 8 core docs (MVP, architecture, API, data model, routing, roadmap, storage, deployment).
