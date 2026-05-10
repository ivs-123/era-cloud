# ERA Cloud Product MVP

## 1) Product Definition

ERA Cloud is a unified platform for selecting, routing, and operating compute/inference/server resources across multiple external providers through one interface.

MVP role: broker + control plane + billing clearing layer.

## 2) ICP and Jobs-to-be-Done

### ICP (initial)

- AI startups and teams with variable inference load
- SMB products that need server capacity without vendor lock-in
- teams optimizing infra spend and uptime with limited DevOps staff

### Jobs-to-be-Done

- "Run my workload at the lowest acceptable cost."
- "Fail over fast if a provider is down."
- "Track spend and usage in one place."
- "Avoid rewriting integrations per provider."

## 3) MVP Scope (In)

- multi-provider adapters (inference + server)
- unified workload model
- policy-based routing
- health checks and fallback
- per-tenant usage metering
- monthly invoice export and wallet/limits
- basic RBAC (owner/admin/member)

## 4) Out of Scope (MVP)

- own physical infrastructure
- advanced autoscaling clusters
- private network mesh between providers
- enterprise SSO/SCIM (v2)
- full marketplace onboarding of third-party sellers

## 5) Core Features

1. Provider Aggregation
2. Routing Engine
3. Unified Control Panel/API
4. Billing/Clearing
5. Hybrid-ready abstraction for future own capacity

## 6) Success Metrics (90 days)

- 10 paying customers
- >95% successful routed workloads
- p95 routing decision time < 100 ms
- 15-25% average customer savings vs single-provider baseline
- invoice accuracy > 99.5%

## 7) Monetization (MVP)

- markup on provider cost (default 8-20%, configurable by workload type)
- optional platform fee by plan
- premium SLA for priority routing (later phase)
