import { nanoid } from "nanoid";
import pg from "pg";
import type { ProviderCapability, WorkloadState } from "@era/common";
import type { EraStore, InvoiceLineRecord, InvoiceRecord, ProviderRecord, RoutingDecisionRecord, TenantKeyRecord, TenantRecord, UsageEventRecord, WorkloadRecord } from "./store.js";

const { Pool } = pg;

export class PostgresStore implements EraStore {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async createTenant(input: { name: string }): Promise<TenantRecord> {
    const result = await this.pool.query(
      "insert into tenants (id, name, status) values ($1, $2, 'active') returning id, name, status, created_at",
      [`ten_${nanoid(10)}`, input.name]
    );

    return mapTenant(result.rows[0]);
  }

  async listTenants(): Promise<TenantRecord[]> {
    const result = await this.pool.query("select id, name, status, created_at from tenants order by created_at desc");
    return result.rows.map(mapTenant);
  }

  async getTenant(id: string): Promise<TenantRecord | undefined> {
    const result = await this.pool.query("select id, name, status, created_at from tenants where id = $1", [id]);
    return result.rows[0] ? mapTenant(result.rows[0]) : undefined;
  }

  async createProvider(input: Omit<ProviderRecord, "id" | "createdAt" | "capabilityDetails"> & { capabilityDetails?: ProviderCapability[] }): Promise<ProviderRecord> {
    const client = await this.pool.connect();
    const providerId = `prov_${nanoid(10)}`;
    const capabilityDetails = input.capabilityDetails ?? input.capabilities.flatMap((profile) =>
      input.regions.map((region) => ({
        region,
        profile,
        priceUnit: "hour" as const,
        priceValueUsd: 1,
        latencyP50Ms: 1000,
        isAvailable: true
      }))
    );

    try {
      await client.query("begin");
      const providerResult = await client.query(
        "insert into providers (id, name, type, status, config_json) values ($1, $2, $3, $4, $5) returning id, name, type, status, created_at",
        [
          providerId,
          input.name,
          input.type,
          input.status,
          {
            regions: input.regions,
            capabilities: input.capabilities
          }
        ]
      );

      for (const capability of capabilityDetails) {
        await client.query(
          `insert into provider_capabilities
            (id, provider_id, region, profile, price_unit, price_value, latency_p50_ms, is_available)
           values ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            `cap_${nanoid(10)}`,
            providerId,
            capability.region,
            capability.profile,
            capability.priceUnit,
            capability.priceValueUsd,
            capability.latencyP50Ms ?? null,
            capability.isAvailable
          ]
        );
      }

      await client.query("commit");
      const provider = mapProvider(providerResult.rows[0], capabilityDetails);
      return provider;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async listProviders(): Promise<ProviderRecord[]> {
    const result = await this.pool.query(
      `select
        p.id,
        p.name,
        p.type,
        p.status,
        p.config_json,
        p.created_at,
        coalesce(
          json_agg(
            json_build_object(
              'region', pc.region,
              'profile', pc.profile,
              'priceUnit', pc.price_unit,
              'priceValueUsd', pc.price_value,
              'latencyP50Ms', pc.latency_p50_ms,
              'isAvailable', pc.is_available
            )
          ) filter (where pc.id is not null),
          '[]'::json
        ) as capability_details
      from providers p
      left join provider_capabilities pc on pc.provider_id = p.id
      group by p.id
      order by p.created_at desc`
    );

    return result.rows.map((row) => mapProvider(row, row.capability_details));
  }

  async updateProviderCapabilities(
    id: string,
    capabilityDetails: ProviderCapability[],
    status: string
  ): Promise<ProviderRecord> {
    const client = await this.pool.connect();

    try {
      await client.query("begin");
      await client.query("update providers set status = $2 where id = $1", [id, status]);
      await client.query("delete from provider_capabilities where provider_id = $1", [id]);

      for (const capability of capabilityDetails) {
        await client.query(
          `insert into provider_capabilities
            (id, provider_id, region, profile, price_unit, price_value, latency_p50_ms, is_available)
           values ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            `cap_${nanoid(10)}`,
            id,
            capability.region,
            capability.profile,
            capability.priceUnit,
            capability.priceValueUsd,
            capability.latencyP50Ms ?? null,
            capability.isAvailable
          ]
        );
      }

      await client.query("commit");

      const providerResult = await client.query(
        "select id, name, type, status, config_json, created_at from providers where id = $1",
        [id]
      );

      return mapProvider(providerResult.rows[0], capabilityDetails);
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async createWorkload(input: Omit<WorkloadRecord, "id" | "createdAt" | "updatedAt">): Promise<WorkloadRecord> {
    const result = await this.pool.query(
      `insert into workloads
        (id, tenant_id, kind, profile, region, routing_policy, state, selected_provider_id, constraints_json, metadata_json)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       returning *`,
      [
        `wl_${nanoid(10)}`,
        input.tenantId,
        input.kind,
        input.profile,
        input.region,
        input.routingPolicy,
        input.state,
        input.selectedProviderId,
        input.constraints,
        input.metadata
      ]
    );

    return mapWorkload(result.rows[0]);
  }

  async listWorkloads(): Promise<WorkloadRecord[]> {
    const result = await this.pool.query("select * from workloads order by created_at desc");
    return result.rows.map(mapWorkload);
  }

  async getWorkload(id: string): Promise<WorkloadRecord | undefined> {
    const result = await this.pool.query("select * from workloads where id = $1", [id]);
    return result.rows[0] ? mapWorkload(result.rows[0]) : undefined;
  }

  async updateWorkloadState(id: string, state: WorkloadState): Promise<WorkloadRecord | undefined> {
    const result = await this.pool.query(
      "update workloads set state = $2, updated_at = now() where id = $1 returning *",
      [id, state]
    );

    return result.rows[0] ? mapWorkload(result.rows[0]) : undefined;
  }

  async createRoutingDecision(input: Omit<RoutingDecisionRecord, "id" | "createdAt">): Promise<RoutingDecisionRecord> {
    const result = await this.pool.query(
      `insert into routing_decisions
        (id, workload_id, tenant_id, winner_provider_id, candidate_scores_json, reason_code)
       values ($1, $2, $3, $4, $5, $6)
       returning *`,
      [
        `rd_${nanoid(10)}`,
        input.workloadId ?? null,
        input.tenantId,
        input.winnerProviderId,
        input.candidateScores,
        input.reasonCode
      ]
    );

    return mapRoutingDecision(result.rows[0]);
  }

  async listRoutingDecisions(): Promise<RoutingDecisionRecord[]> {
    const result = await this.pool.query("select * from routing_decisions order by created_at desc");
    return result.rows.map(mapRoutingDecision);
  }

  async recordUsageEvent(input: Omit<UsageEventRecord, "id">): Promise<UsageEventRecord> {
    const result = await this.pool.query(
      `insert into usage_events (id, tenant_id, workload_id, provider_id, event_time, metric, quantity, unit_cost_usd)
       values ($1, $2, $3, $4, $5, $6, $7, $8) returning *`,
      [`use_${nanoid(10)}`, input.tenantId, input.workloadId, input.providerId, input.eventTime, input.metric, input.quantity, input.unitCostUsd]
    );

    return mapUsageEvent(result.rows[0]);
  }

  async listUsageEvents(params: { tenantId: string; from?: string; to?: string }): Promise<UsageEventRecord[]> {
    const conditions = ["tenant_id = $1"];
    const values: unknown[] = [params.tenantId];

    if (params.from) {
      conditions.push(`event_time >= $${values.length + 1}`);
      values.push(params.from);
    }

    if (params.to) {
      conditions.push(`event_time <= $${values.length + 1}`);
      values.push(params.to);
    }

    const result = await this.pool.query(
      `select * from usage_events where ${conditions.join(" and ")} order by event_time desc`,
      values
    );

    return result.rows.map(mapUsageEvent);
  }

  async createInvoice(input: Omit<InvoiceRecord, "id">): Promise<InvoiceRecord> {
    const client = await this.pool.connect();
    const invoiceId = `inv_${nanoid(10)}`;

    try {
      await client.query("begin");
      await client.query(
        `insert into billing_periods (id, tenant_id, period_start, period_end, status)
         values ($1, $2, date_trunc('month', now()), now(), 'drafted')
         on conflict (id) do nothing`,
        [input.billingPeriodId, input.tenantId]
      );

      await client.query(
        `insert into invoices (id, tenant_id, billing_period_id, subtotal_usd, markup_usd, total_usd, currency, status, issued_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          invoiceId,
          input.tenantId,
          input.billingPeriodId,
          input.subtotalUsd,
          input.markupUsd,
          input.totalUsd,
          input.currency,
          input.status,
          input.issuedAt ?? null
        ]
      );

      for (const line of input.lines) {
        await client.query(
          `insert into invoice_lines (id, invoice_id, workload_id, provider_id, description, quantity, unit_price_usd, amount_usd)
           values ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            `invl_${nanoid(10)}`,
            invoiceId,
            line.workloadId ?? null,
            line.providerId ?? null,
            line.description,
            line.quantity,
            line.unitPriceUsd,
            line.amountUsd
          ]
        );
      }

      await client.query("commit");

      return {
        ...input,
        id: invoiceId
      };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async listInvoices(params: { tenantId?: string }): Promise<InvoiceRecord[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (params.tenantId) {
      conditions.push(`tenant_id = $${values.length + 1}`);
      values.push(params.tenantId);
    }

    const whereClause = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
    const result = await this.pool.query(
      `select * from invoices ${whereClause} order by issued_at desc nulls last`,
      values
    );

    return result.rows.map(mapInvoice);
  }

  async addTenantKey(input: Omit<TenantKeyRecord, "id" | "createdAt">): Promise<TenantKeyRecord> {
    const result = await this.pool.query(
      `insert into tenant_keys (id, tenant_id, provider_name, key_label, key_prefix)
       values ($1, $2, $3, $4, $5)
       returning *`,
      [`key_${nanoid(10)}`, input.tenantId, input.providerName, input.keyLabel, input.keyPrefix]
    );

    return mapTenantKey(result.rows[0]);
  }

  async listTenantKeys(tenantId: string): Promise<TenantKeyRecord[]> {
    const result = await this.pool.query(
      "select * from tenant_keys where tenant_id = $1 order by created_at desc",
      [tenantId]
    );

    return result.rows.map(mapTenantKey);
  }

  async removeTenantKey(id: string, tenantId?: string): Promise<void> {
    if (tenantId) {
      await this.pool.query("delete from tenant_keys where id = $1 and tenant_id = $2", [id, tenantId]);
      return;
    }

    await this.pool.query("delete from tenant_keys where id = $1", [id]);
  }
}

function mapTenant(row: any): TenantRecord {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at.toISOString()
  };
}

function mapProvider(row: any, capabilityDetails: ProviderCapability[]): ProviderRecord {
  const config = row.config_json ?? {};
  const details = capabilityDetails.map((capability) => ({
    ...capability,
    priceValueUsd: Number(capability.priceValueUsd)
  }));

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    status: row.status,
    regions: config.regions ?? [...new Set(details.map((capability) => capability.region))],
    capabilities: config.capabilities ?? [...new Set(details.map((capability) => capability.profile))],
    capabilityDetails: details,
    createdAt: row.created_at.toISOString()
  };
}

function mapWorkload(row: any): WorkloadRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    kind: row.kind,
    profile: row.profile,
    region: row.region,
    routingPolicy: row.routing_policy,
    state: row.state,
    selectedProviderId: row.selected_provider_id,
    constraints: row.constraints_json ?? {},
    metadata: row.metadata_json ?? {},
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

function mapRoutingDecision(row: any): RoutingDecisionRecord {
  return {
    id: row.id,
    workloadId: row.workload_id ?? undefined,
    tenantId: row.tenant_id,
    winnerProviderId: row.winner_provider_id,
    candidateScores: row.candidate_scores_json,
    reasonCode: row.reason_code,
    createdAt: row.created_at.toISOString()
  };
}

function mapUsageEvent(row: any): UsageEventRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    workloadId: row.workload_id,
    providerId: row.provider_id,
    eventTime: row.event_time instanceof Date ? row.event_time.toISOString() : String(row.event_time),
    metric: row.metric,
    quantity: Number(row.quantity),
    unitCostUsd: Number(row.unit_cost_usd)
  };
}

function mapInvoice(row: any): InvoiceRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    billingPeriodId: row.billing_period_id,
    subtotalUsd: Number(row.subtotal_usd),
    markupUsd: Number(row.markup_usd),
    totalUsd: Number(row.total_usd),
    currency: row.currency,
    status: row.status,
    issuedAt: row.issued_at instanceof Date ? row.issued_at.toISOString() : row.issued_at ?? undefined,
    lines: []
  };
}

function mapTenantKey(row: any): TenantKeyRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    providerName: row.provider_name,
    keyLabel: row.key_label,
    keyPrefix: row.key_prefix,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)
  };
}
