# Work History

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
