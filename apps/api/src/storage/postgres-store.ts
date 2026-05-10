import { nanoid } from "nanoid";
import pg from "pg";
import type { ProviderCapability, WorkloadState } from "@era/common";
import type { EraStore, ProviderRecord, RoutingDecisionRecord, TenantRecord, WorkloadRecord } from "./store.js";

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

