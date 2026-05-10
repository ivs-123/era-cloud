# ERA Cloud Routing Policies (MVP)

## 1) Candidate Filtering

Before scoring, candidate providers are filtered by hard constraints:

- required `kind` and `profile`
- required `region` (or allowed region set)
- provider health not `down`
- estimated cost <= `max_hourly_cost_usd` (if provided)

If no candidates remain, response is `NO_CAPACITY_MATCH`.

## 2) Scoring Inputs

- normalized cost score (lower is better)
- normalized latency score
- availability score (recent success ratio)
- tenant/provider preference weight (optional)

## 3) Policies

### `cheapest`

`score = 0.70 * cost + 0.20 * availability + 0.10 * latency`

Use when customer prioritizes spend.

### `balanced`

`score = 0.45 * cost + 0.35 * latency + 0.20 * availability`

Default policy for mixed workloads.

### `low-latency`

`score = 0.20 * cost + 0.60 * latency + 0.20 * availability`

Use for real-time or user-facing inference.

## 4) Tie Breakers

1. higher availability
2. lower recent error rate
3. lower absolute cost

## 5) Failover Behavior

- on provisioning/API error, try next ranked provider
- maximum 2 fallback attempts in MVP
- record all attempts in routing decision trace

## 6) Decision Audit Payload

Store:

- selected provider
- ranked candidates with scores
- excluded providers with reason codes
- policy and weights used
