# Current Focus

## Product Direction

ERA Cloud is a cloud platform for GPU servers and inference across 40+ providers. One dashboard, one API, one bill.

Stage 1 now:

- Pure aggregation.
- Route to the cheapest viable provider.
- Earn via markup, SaaS fee, or partner margin.

Stage 2 after revenue:

- Own GPU virtualization and timeshare capacity.
- Preemptible prototyping tier.
- Higher margin infrastructure layer.

## Deployment Status

| Component | URL | Status |
| --- | --- | --- |
| Frontend | `ivs-123.github.io/era-cloud` | Live, auto-deploy |
| Custom domain | `eracloud.pro` | CNAME set in GitHub Pages, needs Cloudflare DNS |
| API | `api.eracloud.pro` | `render.yaml` ready, one-click deploy with PGlite disk |
| CI/CD | GitHub Actions | Typecheck, tests, build, deploy |
| Code | `github.com/ivs-123/era-cloud` | Public, 36 commits |

## Current Next Steps

1. Cloudflare DNS - CNAME `eracloud.pro` -> `ivs-123.github.io`.
2. Render - one-click deploy via `render.com/deploy?repo=https://github.com/ivs-123/era-cloud`.
3. Provider tokens - register on DeepInfra, Groq, Together AI, Fireworks, Vast.ai, RunPod.
4. Live PostgreSQL - validate PostgresStore with Render PG or Neon.

## Active Caveats

- No real provider API tokens except Thunder Compute via tools.
- PGlite persistence and repo-root startup are tested locally and mapped to a Render disk; live PostgreSQL remains untested.
- Render health checks use `/health`, bypassing auth and rate limiting.
- npm audit high blockers are clear; remaining moderate PostCSS warning is through Next and requires unsafe force downgrade.
- E2E memory/PGlite flows are tested; real provider flows still need credentials.

## What Changed Since Last Audit

- Users/API keys persisted through store.
- PGlite storage driver implemented and tested across app restarts.
- Render blueprint now persists `/var/data` and no longer creates an unused Postgres service.
- scrypt passwords and SHA-256 API key hashes.
- 12 tests.
- Tenant isolation on operational routes.
- GitHub Actions now runs typecheck and tests before deploy.
- GPU price hero and timeshare roadmap are documented.
