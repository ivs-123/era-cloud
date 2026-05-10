create table tenants (
  id text primary key,
  name text not null,
  status text not null check (status in ('active', 'suspended')),
  created_at timestamptz not null default now()
);

create table users (
  id text primary key,
  tenant_id text not null references tenants(id),
  email text not null,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create table providers (
  id text primary key,
  name text not null,
  type text not null check (type in ('inference', 'server')),
  status text not null check (status in ('healthy', 'degraded', 'down')),
  config_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table provider_capabilities (
  id text primary key,
  provider_id text not null references providers(id),
  region text not null,
  profile text not null,
  price_unit text not null,
  price_value numeric(14, 6) not null,
  latency_p50_ms integer,
  is_available boolean not null default true,
  updated_at timestamptz not null default now()
);

create table workloads (
  id text primary key,
  tenant_id text not null references tenants(id),
  kind text not null,
  profile text not null,
  region text not null,
  routing_policy text not null,
  state text not null,
  selected_provider_id text references providers(id),
  constraints_json jsonb not null default '{}'::jsonb,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table routing_decisions (
  id text primary key,
  workload_id text not null references workloads(id),
  tenant_id text not null references tenants(id),
  winner_provider_id text not null references providers(id),
  candidate_scores_json jsonb not null,
  reason_code text not null,
  created_at timestamptz not null default now()
);

create table usage_events (
  id text primary key,
  tenant_id text not null references tenants(id),
  workload_id text not null references workloads(id),
  provider_id text not null references providers(id),
  event_time timestamptz not null,
  metric text not null,
  quantity numeric(18, 6) not null,
  unit_cost_usd numeric(14, 8) not null
);

create index workloads_tenant_created_idx on workloads (tenant_id, created_at desc);
create index usage_events_tenant_time_idx on usage_events (tenant_id, event_time desc);
create index usage_events_workload_time_idx on usage_events (workload_id, event_time desc);
create index provider_capabilities_lookup_idx on provider_capabilities (provider_id, region, profile, is_available);
