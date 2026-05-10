# ERA Cloud API Contracts v1

Base URL: `/api/v1`

Auth: `Authorization: Bearer <token>`

Tenant context: derived from token.

## 1) Providers

### GET `/providers`

Returns connected providers and health summary.

Response fields:
- `id`
- `name`
- `type` (`inference` | `server`)
- `status` (`healthy` | `degraded` | `down`)
- `regions[]`
- `capabilities[]`

## 2) Workloads

### POST `/workloads`

Create workload routed by policy.

Request:

```json
{
  "tenant_id": "ten_123",
  "kind": "inference",
  "profile": "llm-text-gen-small",
  "region": "eu-central",
  "routing_policy": "balanced",
  "max_hourly_cost_usd": 2.5,
  "latency_target_ms": 1200,
  "metadata": {
    "project": "assistant-api"
  }
}
```

Response:

```json
{
  "id": "wl_123",
  "state": "provisioning",
  "selected_provider_id": "prov_aws_like",
  "routing_reason": "balanced_score_best",
  "created_at": "2026-03-29T10:00:00Z"
}
```

### GET `/workloads/{id}`

Returns workload state, provider mapping, runtime metrics summary.

### POST `/workloads/{id}/stop`

Stops workload gracefully (idempotent).

### GET `/workloads`

List workloads with filters:
- `state`
- `kind`
- `provider_id`
- `created_from`
- `created_to`

## 3) Routing Simulation

### POST `/routing/simulate`

Evaluates provider decision without deployment.

Request:

```json
{
  "kind": "inference",
  "profile": "llm-text-gen-small",
  "region": "eu-central",
  "routing_policy": "cheapest"
}
```

Response:

```json
{
  "winner_provider_id": "prov_x",
  "ranked_candidates": [
    { "provider_id": "prov_x", "score": 0.91, "estimated_hourly_cost_usd": 1.22 },
    { "provider_id": "prov_y", "score": 0.86, "estimated_hourly_cost_usd": 1.34 }
  ]
}
```

## 4) Usage and Billing

### GET `/usage`

Filters:
- `from`
- `to`
- `group_by` (`day` | `provider` | `workload`)

### GET `/billing/estimate`

Returns projected month-end spend and breakdown.

### GET `/billing/invoices`

Returns generated invoices list.

## 5) Admin (MVP Internal)

### POST `/admin/providers`

Register provider credentials/config.

Request:

```json
{
  "name": "Fast GPU",
  "type": "inference",
  "status": "healthy",
  "regions": ["eu-central"],
  "capabilities": ["llm-text-gen-small"],
  "capability_details": [
    {
      "region": "eu-central",
      "profile": "llm-text-gen-small",
      "priceUnit": "hour",
      "priceValueUsd": 1.6,
      "latencyP50Ms": 350,
      "isAvailable": true
    }
  ]
}
```

### POST `/admin/pricing/rules`

Define markup and plan-specific pricing rules.
