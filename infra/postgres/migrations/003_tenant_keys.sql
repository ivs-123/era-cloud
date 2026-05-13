create table tenant_keys (
  id text primary key,
  tenant_id text not null references tenants(id),
  provider_name text not null,
  key_label text not null,
  key_prefix text not null,
  created_at timestamptz not null default now()
);

create index tenant_keys_tenant_created_idx on tenant_keys (tenant_id, created_at desc);

