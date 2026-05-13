# Current Focus

## Product Direction

ERA Cloud is a **cloud platform** — unified control plane for GPU servers, compute, and inference capacity across 40+ external providers. One dashboard, one API, one bill.

**Primary:** GPU server provisioning. **Secondary:** Inference API routing.

## Deployment Status

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | `https://ivs-123.github.io/era-cloud/` | ✅ Live |
| Custom domain | `eracloud.pro` | ⏳ Needs Cloudflare CNAME |
| API | `api.eracloud.pro` | ⏳ Needs Render deploy |
| CI/CD | GitHub Actions | ✅ Auto-deploy on push |
| Code | `github.com/ivs-123/era-cloud` | ✅ Public |

## Current Next Steps

1. **Cloudflare DNS** — add CNAME `eracloud.pro` → `ivs-123.github.io`
2. **Render** — deploy API via `render.com/deploy?repo=https://github.com/ivs-123/era-cloud`
3. **Provider tokens** — register on DeepInfra, Groq, Together AI, Vast.ai, RunPod
4. **PostgreSQL** — validate persistence (Docker or cloud PG)

## Active Caveats

- PostgreSQL unvalidated (Docker unavailable, Windows PG 17 fails DLL init).
- Only Thunder Compute has accessible API (via chat tools). 39 providers are stubs.
- npm audit: 3 vulnerabilities from Next.js postcss dep.
- Brand: `eracloud.pro` vs `eraone` ecosystem decision pending.
- GitHub Pages: 25 commits, auto-deploy via Actions.
