import { nanoid } from "nanoid";
import type { ProviderCapability, WorkloadState } from "@era/common";
import type { EraStore, InvoiceRecord, ProviderRecord, RoutingDecisionRecord, TenantKeyRecord, TenantRecord, UsageEventRecord, WorkloadRecord, UserRecord, ApiKeyRecord } from "./store.js";

export class MemoryStore implements EraStore {
  private tenants = new Map<string, TenantRecord>();
  private providers = new Map<string, ProviderRecord>();
  private workloads = new Map<string, WorkloadRecord>();
  private routingDecisions = new Map<string, RoutingDecisionRecord>();
  private usageEvents = new Map<string, UsageEventRecord>();
  private invoices = new Map<string, InvoiceRecord>();
  private tenantKeys = new Map<string, TenantKeyRecord>();
  private users = new Map<string, UserRecord>();
  private apiKeys = new Map<string, ApiKeyRecord>();

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

  async updateProviderCapabilities(id: string, capabilityDetails: ProviderCapability[], status: string): Promise<ProviderRecord> {
    const provider = this.providers.get(id);

    if (!provider) {
      throw new Error(`Provider ${id} not found`);
    }

    const updated: ProviderRecord = {
      ...provider,
      status: status as ProviderRecord["status"],
      capabilityDetails,
      capabilities: [...new Set(capabilityDetails.map((capability) => capability.profile))],
      regions: [...new Set(capabilityDetails.map((capability) => capability.region))]
    };

    this.providers.set(id, updated);
    return updated;
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

  async recordUsageEvent(input: Omit<UsageEventRecord, "id">): Promise<UsageEventRecord> {
    const event: UsageEventRecord = {
      ...input,
      id: `use_${nanoid(10)}`
    };

    this.usageEvents.set(event.id, event);
    return event;
  }

  async listUsageEvents(params: { tenantId: string; from?: string; to?: string }): Promise<UsageEventRecord[]> {
    return [...this.usageEvents.values()]
      .filter((event) => event.tenantId === params.tenantId)
      .filter((event) => {
        if (params.from && event.eventTime < params.from) return false;
        if (params.to && event.eventTime > params.to) return false;
        return true;
      })
      .sort((a, b) => b.eventTime.localeCompare(a.eventTime));
  }

  async createInvoice(input: Omit<InvoiceRecord, "id">): Promise<InvoiceRecord> {
    const invoice: InvoiceRecord = {
      ...input,
      id: `inv_${nanoid(10)}`
    };

    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  async listInvoices(params: { tenantId?: string }): Promise<InvoiceRecord[]> {
    const invoices = [...this.invoices.values()];

    if (params.tenantId) {
      return invoices
        .filter((invoice) => invoice.tenantId === params.tenantId)
        .sort((a, b) => (b.issuedAt ?? "").localeCompare(a.issuedAt ?? ""));
    }

    return invoices.sort((a, b) => (b.issuedAt ?? "").localeCompare(a.issuedAt ?? ""));
  }

  async addTenantKey(input: Omit<TenantKeyRecord, "id" | "createdAt">): Promise<TenantKeyRecord> {
    const key: TenantKeyRecord = {
      ...input,
      id: `key_${nanoid(10)}`,
      createdAt: new Date().toISOString()
    };

    this.tenantKeys.set(key.id, key);
    return key;
  }

  async listTenantKeys(tenantId: string): Promise<TenantKeyRecord[]> {
    return [...this.tenantKeys.values()].filter((key) => key.tenantId === tenantId);
  }

  async removeTenantKey(id: string, tenantId?: string): Promise<void> {
    const key = this.tenantKeys.get(id);
    if (tenantId && key?.tenantId !== tenantId) {
      return;
    }

    this.tenantKeys.delete(id);
  }

  async createUser(input: Omit<UserRecord, "id" | "createdAt">): Promise<UserRecord> {
    const user: UserRecord = {
      ...input,
      id: `usr_${nanoid(12)}`,
      createdAt: new Date().toISOString()
    };
    this.users.set(user.id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<UserRecord | undefined> {
    return [...this.users.values()].find((u) => u.email === email);
  }

  async addApiKey(input: Omit<ApiKeyRecord, "id" | "createdAt">): Promise<ApiKeyRecord> {
    const key: ApiKeyRecord = {
      ...input,
      id: `ak_${nanoid(10)}`,
      createdAt: new Date().toISOString()
    };
    this.apiKeys.set(key.id, key);
    return key;
  }

  async listApiKeys(tenantId: string): Promise<ApiKeyRecord[]> {
    return [...this.apiKeys.values()].filter((k) => k.tenantId === tenantId);
  }
}
