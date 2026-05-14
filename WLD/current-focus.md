# Current Focus

## Product Direction

ERA Cloud is a **cloud platform** — GPU servers and inference across 40+ providers. One dashboard, one API, one bill.

**Stage 1 (now):** Pure aggregation — route to cheapest provider, markup the difference.
**Stage 2 (post-revenue):** Own GPU virtualization (timeshare like ThunderCompute).

## Deployment Status

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | `ivs-123.github.io/era-cloud` | ✅ Live, auto-deploy |
| Custom domain | `eracloud.pro` | ⏳ CNAME set, needs Cloudflare DNS |
| API | `api.eracloud.pro` | ⏳ render.yaml ready, one-click deploy |
| CI/CD | GitHub Actions | ✅ Auto-deploy on push (35s) |
| Code | `github.com/ivs-123/era-cloud` | ✅ Public, 36 commits |

## Current Next Steps

1. **Cloudflare DNS** — CNAME `eracloud.pro` → `ivs-123.github.io`
2. **Render** — one-click deploy via `render.com/deploy?repo=https://github.com/ivs-123/era-cloud`
3. **Provider tokens** — register on DeepInfra, Groq, Together AI (evening task)
4. **PostgreSQL** — validate with Render PG or Neon

## Active Caveats

- No real provider API tokens (except Thunder Compute via tools).
- PostgreSQL: PostgresStore compiles, migrations ready (001-005), untested on live DB.
- npm audit: 3 vulnerabilities (Next.js postcss, not fixable without breaking downgrade).
- E2e tested: register → sync 6 providers → H100 workload → invoice $5.46 ✅

## What Changed Since Last Audit (ChatGPT)

- Users/API keys persisted through store (no in-memory Maps).
- scrypt passwords, SHA-256 API key hashes.
- 9 tests (was 5) — added security + postgres-migrations tests.
- Tenant isolation on all operational routes.
- GPU price hero on landing page (H100 $1.30/h, A100 $0.55/h, 5x cheaper).
- Timeshare section: "Why our prices are low".
- Preempt/resume API + prototyping mode for future GPU virtualization.
- Comprehensive GPU virtualization roadmap (Stage 2).
