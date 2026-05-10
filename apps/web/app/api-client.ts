const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

async function request<T>(path: string, options?: FetchOptions): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);

  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error ?? error.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export interface ApiTenant {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

export interface ApiProvider {
  id: string;
  name: string;
  type: string;
  status: string;
  regions: string[];
  capabilities: string[];
  capabilityDetails: ApiCapability[];
  createdAt: string;
}

export interface ApiCapability {
  region: string;
  profile: string;
  priceUnit: string;
  priceValueUsd: number;
  latencyP50Ms?: number;
  isAvailable: boolean;
}

export interface ApiWorkload {
  id: string;
  tenantId: string;
  kind: string;
  profile: string;
  region: string;
  routingPolicy: string;
  state: string;
  selectedProviderId: string;
  constraints: { maxHourlyCostUsd?: number; latencyTargetMs?: number };
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ApiRoutingSimulation {
  winner_provider_id: string;
  reason_code: string;
  ranked_candidates: ApiRoutingCandidate[];
}

export interface ApiRoutingCandidate {
  provider_id: string;
  provider_name: string;
  score: number;
  estimated_hourly_cost_usd: number;
  latency_p50_ms: number;
  status: string;
}

export interface ApiProviderInstance {
  id: string;
  name: string;
  status: string;
  gpuType: string;
  numGpus: number;
  cpuCores: number;
  memory: string;
  storage: number;
  ip?: string;
  template: string;
  createdAt: string;
}

export interface ApiSyncResult {
  provider: ApiProvider;
  capabilities_count: number;
  status: string;
}

function unwrap<T>(response: { data: T }): T {
  return response.data;
}

export const api = {
  tenants: {
    list: () => request<{ data: ApiTenant[] }>("/api/v1/tenants").then(unwrap),
    create: (name: string) =>
      request<{ data: ApiTenant }>("/api/v1/tenants", {
        method: "POST",
        body: JSON.stringify({ name })
      }).then(unwrap)
  },

  providers: {
    list: () => request<{ data: ApiProvider[] }>("/api/v1/providers").then(unwrap),
    create: (params: {
      name: string;
      type: string;
      regions: string[];
      capabilities: string[];
      capability_details?: ApiCapability[];
    }) =>
      request<{ data: ApiProvider }>("/api/v1/admin/providers", {
        method: "POST",
        body: JSON.stringify({
          name: params.name,
          type: params.type,
          status: "healthy",
          regions: params.regions,
          capabilities: params.capabilities,
          capability_details: params.capability_details
        })
      }).then(unwrap),

    sync: (name: string) =>
      request<{ data: ApiSyncResult }>(`/api/v1/providers/${name}/sync`, {
        method: "POST"
      }).then(unwrap),

    listInstances: (name: string) =>
      request<{ data: ApiProviderInstance[] }>(`/api/v1/providers/${name}/instances`).then(unwrap),

    createInstance: (name: string, params: {
      tenant_id: string;
      gpu_type: string;
      num_gpus: number;
      cpu_cores: number;
      disk_size_gb: number;
      template: string;
      region: string;
      mode: string;
      public_key?: string;
    }) =>
      request<{ data: ApiProviderInstance }>(`/api/v1/providers/${name}/instances`, {
        method: "POST",
        body: JSON.stringify(params)
      }).then(unwrap),

    stopInstance: (name: string, instanceId: string) =>
      request<{ data: { id: string; status: string } }>(
        `/api/v1/providers/${name}/instances/${instanceId}/stop`,
        { method: "POST" }
      ).then(unwrap)
  },

  workloads: {
    list: () => request<{ data: ApiWorkload[] }>("/api/v1/workloads").then(unwrap),
    create: (params: {
      tenant_id: string;
      kind: string;
      profile: string;
      region: string;
      routing_policy: string;
      max_hourly_cost_usd?: number;
      latency_target_ms?: number;
      metadata?: Record<string, string>;
    }) =>
      request<{ data: { id: string; state: string; selected_provider_id: string; routing_reason: string; created_at: string } }>(
        "/api/v1/workloads",
        { method: "POST", body: JSON.stringify(params) }
      ).then(unwrap),

    stop: (id: string) =>
      request<{ data: ApiWorkload }>(`/api/v1/workloads/${id}/stop`, {
        method: "POST"
      }).then(unwrap)
  },

  routing: {
    simulate: (params: {
      kind: string;
      profile: string;
      region: string;
      routing_policy: string;
      max_hourly_cost_usd?: number;
      latency_target_ms?: number;
    }) =>
      request<{ data: ApiRoutingSimulation }>("/api/v1/routing/simulate", {
        method: "POST",
        body: JSON.stringify(params)
      }).then(unwrap)
  },

  health: () => request<{ status: string }>("/health")
};
