create table if not exists auth_users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  tenant_id text not null references tenants(id),
  role text not null default 'owner',
  created_at timestamptz not null default now()
);

create table if not exists auth_api_keys (
  id text primary key,
  tenant_id text not null references tenants(id),
  user_id text not null references auth_users(id),
  prefix text not null,
  hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index auth_users_email_idx on auth_users (email);
create index auth_api_keys_tenant_idx on auth_api_keys (tenant_id, is_active);
