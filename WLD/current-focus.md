# Current Focus

## Product Direction

ERA Cloud is a **cloud platform** — unified control plane for GPU servers, compute, and inference capacity across 40+ external providers.

**Primary:** GPU server provisioning. Spin up H100/A100/L40S on the cheapest provider. One dashboard. One bill.

**Secondary:** Inference API routing. Same OpenAI SDK, auto-routed to cheapest model provider.

## Current Engineering Focus

**Make the product work end-to-end with real providers.** Architecture is solid, all stubs are in place. Need live API tokens.

## Current Next Step

Register on DeepInfra, Groq, Together AI, Vast.ai, RunPod to get API tokens and test real inference + GPU deployment.

Expected flow:

1. Get API tokens from 5+ providers.
2. Configure `THUNDER_API_TOKEN`, `DEEPINFRA_TOKEN`, etc. in `.env`.
3. Sync providers via `/api/v1/providers/:name/sync`.
4. Create real workload or inference call.
5. Verify response comes from actual provider.
6. Generate invoice for real usage.

## Active Caveats

- **PostgreSQL:** Unvalidated. Docker unavailable. Windows PG 17 fails to start (DLL 0xC0000142).
- **Provider tokens:** Only Thunder Compute accessible (via chat tools). 39 providers are stubs.
- **Domain:** `eracloud.pro` registered with Cloudflare DNS. No deployment yet.
- **npm audit:** 3 vulnerabilities (moderate/high from Next.js postcss dependency).
- **Brand decision pending:** `eracloud.pro` vs `eraone` as ecosystem brand.
- **Git:** 19 commits, no remote configured.
