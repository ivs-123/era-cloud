# Current Focus

## Product Direction

ERA Cloud is a broker/control-plane platform for compute, inference, and server capacity across external providers.

The business starts as:

- provider aggregator (Thunder, GCP, AWS, Alibaba, Oracle, Cloud.ru, Selectel, Yandex Cloud)
- workload router (cheapest, balanced, low-latency)
- unified control panel/API
- billing and clearing layer
- later hybrid cloud with own capacity

## Current Engineering Focus

Build a revenue-capable v1 with:

- **Provider adapter framework** — standardized interface for all cloud providers
- **Thunder Compute integration** — first real GPU provider with live API
- **Interactive dashboard** — Next.js admin panel (workloads, providers, billing)
- **Billing engine** — usage metering, spend projection, invoice generation
- **Real API testing** — validate Thunder adapter with live token

## Current Next Step

1. Obtain and configure `THUNDER_API_TOKEN` for live Thunder Compute API validation.
2. Run end-to-end: sync Thunder → register as provider → create workload → stop workload → generate invoice.
3. Begin implementing real API clients for remaining providers (GCP, Yandex Cloud priority).

Expected flow for Thunder validation:

```powershell
$env:THUNDER_API_URL="https://api.thundercompute.com:8443/v1"
$env:THUNDER_API_TOKEN="<token>"
npm.cmd run dev:api
# Then via dashboard: Providers → Sync "thunder-compute" → see real GPU instances
```

## Active Caveats

- Docker CLI unavailable — PostgreSQL validation deferred.
- PostgresStore compiles, untested against live DB.
- `npm audit` reports 3 vulnerabilities (2 moderate, 1 high) from Next.js postcss dep.
- Windows PostgreSQL 17 installed but fails to start (DLL init error 0xC0000142).
- Git repository initialized, but no remote configured.
