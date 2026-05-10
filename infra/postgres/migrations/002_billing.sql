create table billing_periods (
  id text primary key,
  tenant_id text not null references tenants(id),
  period_start timestamptz not null,
  period_end timestamptz not null,
  status text not null check (status in ('open', 'drafted', 'issued', 'void')),
  created_at timestamptz not null default now()
);

create table invoices (
  id text primary key,
  tenant_id text not null references tenants(id),
  billing_period_id text not null references billing_periods(id),
  subtotal_usd numeric(14, 6) not null,
  markup_usd numeric(14, 6) not null,
  total_usd numeric(14, 6) not null,
  currency text not null default 'USD',
  status text not null check (status in ('draft', 'issued', 'paid', 'void')),
  issued_at timestamptz
);

create table invoice_lines (
  id text primary key,
  invoice_id text not null references invoices(id),
  workload_id text references workloads(id),
  provider_id text references providers(id),
  description text not null,
  quantity numeric(18, 6) not null,
  unit_price_usd numeric(14, 8) not null,
  amount_usd numeric(14, 6) not null
);

create index billing_periods_tenant_period_idx on billing_periods (tenant_id, period_start, period_end);
create index invoices_tenant_issued_idx on invoices (tenant_id, issued_at desc);

