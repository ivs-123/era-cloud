# ERA Cloud System Architecture (MVP)

## 1) High-Level Components

1. API Gateway
- auth, tenant context, rate limiting

2. Control Plane Service
- workload CRUD
- lifecycle orchestration
- provider abstraction calls

3. Routing Engine
- chooses provider by policy and constraints
- failover and fallback

4. Provider Adapter Layer
- normalized interface for each provider
- health and capability sync

5. Metering Service
- captures usage events
- aggregates billable units

6. Billing/Clearing Service
- pricing rules, markup, invoice generation

7. Monitoring/Observability
- metrics, logs, traces, alerts

## 2) Data Flow

1. Client sends create workload request with policy/constraints.
2. Control Plane asks Routing Engine for provider decision.
3. Adapter executes provisioning/inference call at selected provider.
4. Runtime usage events are ingested into Metering.
5. Billing aggregates usage and applies pricing rules.
6. Client sees workload state, usage, and cost in API/UI.

## 3) Integration Contracts

Each provider adapter must support:

- `listCapabilities()`
- `healthStatus()`
- `createWorkload()`
- `stopWorkload()`
- `getWorkloadStatus()`
- `collectUsage(from, to)`

## 4) Reliability Defaults

- retry strategy: exponential backoff (3 attempts)
- circuit breaker per provider
- failover chain per route policy
- idempotency keys for create/stop operations

## 5) Security Baseline

- tenant isolation by `tenant_id`
- API keys scoped by tenant + role
- audit logs for sensitive actions
- encrypted provider credentials (KMS or vault)
