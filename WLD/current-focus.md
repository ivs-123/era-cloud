# Current Focus

## Product Direction

ERA Cloud is a cloud platform: unified control plane for GPU servers, compute, and inference capacity across 40+ external providers. One dashboard, one API, one bill.

Primary product surface: GPU server provisioning.

Secondary product surface: inference API routing.

## Deployment Status

| Component | URL | Status |
| --- | --- | --- |
| Frontend | `https://ivs-123.github.io/era-cloud/` | Live |
| Custom domain | `eracloud.pro` | Needs Cloudflare CNAME |
| API | `api.eracloud.pro` | Needs Render deploy |
| CI/CD | GitHub Actions | Auto-deploy on push |
| Code | `github.com/ivs-123/era-cloud` | Public |

## Current Next Steps

1. Cloudflare DNS - add CNAME `eracloud.pro` -> `ivs-123.github.io`.
2. Render - deploy API via `render.com/deploy?repo=https://github.com/ivs-123/era-cloud`.
3. Provider tokens - register on DeepInfra, Groq, Together AI, Vast.ai, RunPod, and confirm Thunder Compute production access.
4. Live PostgreSQL - validate PostgresStore against Docker, Neon, Supabase, or Render PostgreSQL.

## Active Caveats

- SQL migrations validate in PGlite; live PostgreSQL runtime still needs validation.
- Auth users and generated API keys are still in memory, so API production auth persistence is not ready.
- Only Thunder Compute has accessible API credentials so far. Most provider adapters are stubs until real provider credentials and contracts are available.
- npm audit high findings were fixed. Remaining moderate warning is Next/PostCSS and npm suggests unsafe force downgrade.
- Brand decision pending: `eracloud.pro` vs `eraone` ecosystem umbrella.
- GitHub Pages auto-deploy is configured.
