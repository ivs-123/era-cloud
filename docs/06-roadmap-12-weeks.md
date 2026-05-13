# ERA Cloud Roadmap (12 Weeks)

## Phase A: Foundation (Week 1-2)

## Goals
- repo bootstrap
- auth + tenant model
- provider abstraction interface

## Deliverables
- backend skeleton modules (`auth`, `tenants`, `providers`, `workloads`)
- PostgreSQL migrations for core tables
- provider adapter contract + mock adapter
- health endpoint and structured logging

## Exit Criteria
- create tenant/user
- register provider config
- list providers with health status

## Current Status
- Completed: monorepo bootstrap
- Completed: common TypeScript types
- Completed: API skeleton with health, tenants, providers
- Completed: provider registration with capability details
- Completed: initial PostgreSQL migration
- Completed: repository interface for memory/PostgreSQL storage
- Completed: PostgreSQL store implementation for tenants, providers, workloads, and routing decisions
- Completed: SQL migration runner
- Completed: Docker Compose PostgreSQL for local persistence
- Completed: `eracloud.pro` Cloudflare domain plan
- Completed: minimal Next.js dashboard shell

## Phase B: Routing + Workloads (Week 3-5)

## Goals
- implement routing engine and lifecycle orchestration

## Deliverables
- candidate filtering and scoring
- policies: `cheapest`, `balanced`, `low-latency`
- `POST /workloads`, `GET /workloads/{id}`, `POST /workloads/{id}/stop`
- retry/circuit-breaker/failover logic

## Exit Criteria
- successful end-to-end routed workload via mock + one real provider
- persisted routing decision trace

## Current Status
- Completed: `POST /api/v1/routing/simulate`
- Completed: routing policies `cheapest`, `balanced`, `low-latency`
- Completed: `POST /api/v1/workloads`
- Completed: `GET /api/v1/workloads`
- Completed: `GET /api/v1/workloads/{id}`
- Completed: `POST /api/v1/workloads/{id}/stop`
- Completed: in-memory routing decision audit records
- Completed: provider adapter contract and registry
- Completed: Thunder Compute adapter scaffold
- Pending: production credentials and real provider validation for each provider adapter
- Pending: live PostgreSQL validation against Docker/Neon/Supabase/Render PostgreSQL

## Phase C: Metering + Billing (Week 6-8)

## Goals
- build usage accounting and billing foundation

## Deliverables
- usage event ingestion
- daily aggregation job
- invoice draft generation for period
- `GET /usage`, `GET /billing/estimate`, `GET /billing/invoices`

## Exit Criteria
- invoice totals reconcile with usage events within accepted tolerance

## Phase D: Control Panel + Ops (Week 9-10)

## Goals
- ship usable v1 interface and observability

## Deliverables
- customer dashboard (workloads, provider, usage, cost)
- admin view for provider/pricing rules
- alerts for provider degradation and routing failures

## Exit Criteria
- operator can investigate failed routing from UI only

## Phase E: Hardening + Launch (Week 11-12)

## Goals
- stabilize for first paying tenants

## Deliverables
- load tests and reliability fixes
- security review (secrets, RBAC, audit logs)
- onboarding docs and runbooks
- beta launch with 3-5 design partners

## Exit Criteria
- p95 decision latency < 100 ms at target load
- no Sev-1 open issues
- first invoice successfully issued

## Week 1 First-Commit Checklist

1. Create monorepo structure (`apps/api`, `apps/web`, `packages/common`).
2. Setup TypeScript config + lint + format.
3. Add PostgreSQL migration tooling.
4. Implement minimal `tenants` and `providers` APIs.
5. Add integration tests for provider registration/listing.
