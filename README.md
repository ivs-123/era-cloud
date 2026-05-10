# ERA Cloud

ERA Cloud is a unified control plane for compute, inference, and server capacity across multiple providers.

## Positioning

ERA Cloud starts as a broker + routing + billing layer over external infrastructure providers:

- GPU/inference providers
- VPS/dedicated providers
- storage providers (next phase)

The platform gives customers a single API and UI for provisioning, routing, monitoring, and cost control.

## MVP Goal

Launch a revenue-capable v1 that provides:

- provider aggregation (2-3 inference, 1-2 server providers)
- routing policies (`cheapest`, `balanced`, `low-latency`)
- unified workload lifecycle API
- usage metering and customer billing
- basic failover and provider switching

## Core Documents

- [Worklogdoc (WLD)](WLD/README.md)
- [Product MVP](docs/01-product-mvp.md)
- [System Architecture](docs/02-system-architecture.md)
- [API Contracts v1](docs/03-api-contracts-v1.md)
- [Data Model (PostgreSQL)](docs/04-data-model-postgres.md)
- [Routing Policies](docs/05-routing-policies.md)
- [Roadmap (12 Weeks)](docs/06-roadmap-12-weeks.md)
- [Local Storage and PostgreSQL](docs/07-local-storage-and-postgres.md)
- [Domain and Cloudflare Deployment](docs/08-domain-cloudflare-deployment.md)

## Suggested Tech Stack (MVP)

- Backend: TypeScript + Node.js (Fastify/NestJS)
- DB: PostgreSQL
- Queue/Jobs: Redis + BullMQ (or equivalent)
- Metrics: Prometheus/OpenTelemetry + Grafana
- Billing: internal metering + invoice export (Stripe can be added in v1.1)
- Frontend: Next.js admin/customer panel

## Next Action

Start implementation from `docs/06-roadmap-12-weeks.md`, Week 1 checklist.
