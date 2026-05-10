import { nanoid } from "nanoid";
import type { ProviderCapability, WorkloadState } from "@era/common";
import type { EraStore, ProviderRecord, RoutingDecisionRecord, TenantRecord, WorkloadRecord } from "./store.js";

export class MemoryStore implements EraStore {
  private tenants = new Map<string, TenantRecord>();
  private providers = new Map<string, ProviderRecord>();
  private workloads = new Map<string, WorkloadRecord>();
  private routingDecisions = new Map<string, RoutingDecisionRecord>();

  async createTenant(input: { name: string }): Promise<TenantRecord> {
    const tenant: TenantRecord = {
      id: `ten_${nanoid(10)}`,
      name: input.name,
      status: "active",
      createdAt: new Date().toISOString()
    };

    this.tenants.set(tenant.id, tenant);
    return tenant;
  }

  async listTenants(): Promise<TenantRecord[]> {
    return [...this.tenants.values()];
  }

  async getTenant(id: string): Promise<TenantRecord | undefined> {
    return this.tenants.get(id);
  }

  async createProvider(input: Omit<ProviderRecord, "id" | "createdAt" | "capabilityDetails"> & { capabilityDetails?: ProviderCapability[] }): Promise<ProviderRecord> {
    const provider: ProviderRecord = {
      ...input,
      id: `prov_${nanoid(10)}`,
      capabilityDetails: input.capabilityDetails ?? input.capabilities.flatMap((profile) =>
        input.regions.map((region) => ({
          region,
          profile,
          priceUnit: "hour" as const,
          priceValueUsd: 1,
          latencyP50Ms: 1000,
          isAvailable: true
        }))
      ),
      createdAt: new Date().toISOString()
    };

    this.providers.set(provider.id, provider);
    return provider;
  }

  async listProviders(): Promise<ProviderRecord[]> {
    return [...this.providers.values()];
  }

  async createWorkload(input: Omit<WorkloadRecord, "id" | "createdAt" | "updatedAt">): Promise<WorkloadRecord> {
    const now = new Date().toISOString();
    const workload: WorkloadRecord = {
      ...input,
      id: `wl_${nanoid(10)}`,
      createdAt: now,
      updatedAt: now
    };

    this.workloads.set(workload.id, workload);
    return workload;
  }

  async listWorkloads(): Promise<WorkloadRecord[]> {
    return [...this.workloads.values()];
  }

  async getWorkload(id: string): Promise<WorkloadRecord | undefined> {
    return this.workloads.get(id);
  }

  async updateWorkloadState(id: string, state: WorkloadState): Promise<WorkloadRecord | undefined> {
    const workload = this.workloads.get(id);

    if (!workload) {
      return undefined;
    }

    const updated: WorkloadRecord = {
      ...workload,
      state,
      updatedAt: new Date().toISOString()
    };

    this.workloads.set(id, updated);
    return updated;
  }

  async createRoutingDecision(input: Omit<RoutingDecisionRecord, "id" | "createdAt">): Promise<RoutingDecisionRecord> {
    const decision: RoutingDecisionRecord = {
      ...input,
      id: `rd_${nanoid(10)}`,
      createdAt: new Date().toISOString()
    };

    this.routingDecisions.set(decision.id, decision);
    return decision;
  }

  async listRoutingDecisions(): Promise<RoutingDecisionRecord[]> {
    return [...this.routingDecisions.values()];
  }
}
