# ERA Cloud Data Model (PostgreSQL, MVP)

## 1) Core Tables

### `tenants`
- `id` (pk)
- `name`
- `status`
- `created_at`

### `users`
- `id` (pk)
- `tenant_id` (fk -> tenants.id)
- `email` (unique per tenant)
- `role` (`owner` | `admin` | `member`)
- `created_at`

### `providers`
- `id` (pk)
- `name`
- `type` (`inference` | `server`)
- `status`
- `config_json` (encrypted references only)
- `created_at`

### `provider_capabilities`
- `id` (pk)
- `provider_id` (fk)
- `region`
- `profile` (e.g. `llm-text-gen-small`, `gpu-a10g-24gb`)
- `price_unit`
- `price_value`
- `latency_p50_ms`
- `is_available`
- `updated_at`

### `workloads`
- `id` (pk)
- `tenant_id` (fk)
- `kind`
- `profile`
- `region`
- `routing_policy`
- `state`
- `selected_provider_id` (fk -> providers.id, nullable before routing)
- `constraints_json`
- `metadata_json`
- `created_at`
- `updated_at`

### `routing_decisions`
- `id` (pk)
- `workload_id` (fk)
- `tenant_id` (fk)
- `winner_provider_id` (fk)
- `candidate_scores_json`
- `reason_code`
- `created_at`

### `usage_events`
- `id` (pk)
- `tenant_id` (fk)
- `workload_id` (fk)
- `provider_id` (fk)
- `event_time`
- `metric` (`compute_seconds`, `token_input`, `token_output`, `gb_egress`)
- `quantity`
- `unit_cost_usd`

### `billing_periods`
- `id` (pk)
- `tenant_id` (fk)
- `period_start`
- `period_end`
- `status`

### `invoices`
- `id` (pk)
- `tenant_id` (fk)
- `billing_period_id` (fk)
- `subtotal_usd`
- `markup_usd`
- `total_usd`
- `currency`
- `status`
- `issued_at`

### `invoice_lines`
- `id` (pk)
- `invoice_id` (fk)
- `workload_id` (fk, nullable)
- `provider_id` (fk, nullable)
- `description`
- `quantity`
- `unit_price_usd`
- `amount_usd`

## 2) Indexes

- `workloads (tenant_id, created_at desc)`
- `usage_events (tenant_id, event_time desc)`
- `usage_events (workload_id, event_time desc)`
- `provider_capabilities (provider_id, region, profile, is_available)`

## 3) Integrity Rules

- all workload and usage rows must include `tenant_id`
- invoice totals are immutable after `status = issued`
- routing decisions must be stored for auditability
