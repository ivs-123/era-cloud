import type { ProviderCapability, ProviderStatus } from "@era/common";
import type { ProviderTokens } from "../config.js";
import type { CreateInstanceParams, ProviderAdapter, ProviderInstance } from "./adapter.js";

function nanoid(len = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  let id = "";
  for (let i = 0; i < len; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function fetchApi(url: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(10_000) });
}

class LiveInferenceAdapter implements ProviderAdapter {
  readonly type = "inference" as const;
  readonly regions: string[];
  private models: Array<{ profile: string; pricePer1kTokens: number; pricePer1mTokens?: number; regions?: string[] }>;
  private apiKey: string;
  private baseUrl: string;

  constructor(
    readonly name: string,
    baseUrl: string,
    apiKey: string,
    models: Array<{ profile: string; pricePer1kTokens: number; pricePer1mTokens?: number; regions?: string[] }>
  ) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.models = models;
    this.regions = [...new Set(models.flatMap((m) => m.regions ?? ["global"]))];
  }

  async healthCheck(): Promise<ProviderStatus> {
    try {
      const resp = await fetchApi(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });
      if (resp.ok) return "healthy";
      if (resp.status >= 500) return "down";
      return "degraded";
    } catch {
      return "down";
    }
  }

  async syncCapabilities(): Promise<ProviderCapability[]> {
    return this.models.flatMap((m) =>
      (m.regions ?? ["global"]).map((region) => ({
        region,
        profile: m.profile,
        priceUnit: "1k_tokens" as const,
        priceValueUsd: m.pricePer1kTokens,
        latencyP50Ms: m.pricePer1mTokens ? 100 : 200,
        isAvailable: true
      }))
    );
  }

  async listInstances(): Promise<ProviderInstance[]> {
    return [];
  }

  async getInstance(): Promise<ProviderInstance | undefined> {
    return undefined;
  }

  async createInstance(): Promise<ProviderInstance> {
    return {
      id: `inf_${nanoid(8)}`,
      name: `${this.name}-endpoint`,
      status: "running",
      gpuType: "api",
      numGpus: 0,
      cpuCores: 0,
      memory: "N/A",
      storage: 0,
      template: "serverless",
      createdAt: new Date().toISOString()
    };
  }

  async stopInstance(): Promise<void> {}
}

export function createLiveAdapters(tokens: ProviderTokens): ProviderAdapter[] {
  const adapters: ProviderAdapter[] = [];

  if (tokens.groq) {
    adapters.push(
      new LiveInferenceAdapter("groq", "https://api.groq.com/openai/v1", tokens.groq, [
        { profile: "llama-3.3-70b", pricePer1kTokens: 0.00059, pricePer1mTokens: 0.59 },
        { profile: "llama-3.1-8b", pricePer1kTokens: 0.00005, pricePer1mTokens: 0.05 },
        { profile: "mixtral-8x7b", pricePer1kTokens: 0.00024, pricePer1mTokens: 0.24 },
        { profile: "gemma2-9b", pricePer1kTokens: 0.00020, pricePer1mTokens: 0.20 },
        { profile: "deepseek-r1-distill-llama-70b", pricePer1kTokens: 0.00059, pricePer1mTokens: 0.59 }
      ])
    );
  }

  if (tokens.deepinfra) {
    adapters.push(
      new LiveInferenceAdapter("deepinfra", "https://api.deepinfra.com/v1/openai", tokens.deepinfra, [
        { profile: "llama-3.3-70b", pricePer1kTokens: 0.00035, pricePer1mTokens: 0.35 },
        { profile: "llama-3.1-8b", pricePer1kTokens: 0.00006, pricePer1mTokens: 0.06 },
        { profile: "mixtral-8x22b", pricePer1kTokens: 0.00045, pricePer1mTokens: 0.45 },
        { profile: "deepseek-r1", pricePer1kTokens: 0.00055, pricePer1mTokens: 0.55 },
        { profile: "deepseek-v3", pricePer1kTokens: 0.00027, pricePer1mTokens: 0.27 },
        { profile: "qwen-2.5-72b", pricePer1kTokens: 0.00035, pricePer1mTokens: 0.35 }
      ])
    );
  }

  if (tokens.fireworks) {
    adapters.push(
      new LiveInferenceAdapter("fireworks", "https://api.fireworks.ai/inference/v1", tokens.fireworks, [
        { profile: "llama-3.3-70b", pricePer1kTokens: 0.00053, pricePer1mTokens: 0.53 },
        { profile: "llama-3.1-8b", pricePer1kTokens: 0.00008, pricePer1mTokens: 0.08 },
        { profile: "mixtral-8x22b", pricePer1kTokens: 0.00054, pricePer1mTokens: 0.54 },
        { profile: "deepseek-r1", pricePer1kTokens: 0.00055, pricePer1mTokens: 0.55 },
        { profile: "qwen-2.5-72b", pricePer1kTokens: 0.00038, pricePer1mTokens: 0.38 },
        { profile: "qwq-32b", pricePer1kTokens: 0.00030, pricePer1mTokens: 0.30 }
      ])
    );
  }

  if (tokens.vastai) {
    adapters.push(
      new LiveGpuAdapter(
        "vastai",
        "https://console.vast.ai/api/v0",
        tokens.vastai,
        "api_key",
        ["us-east", "us-west", "eu-west"],
        [
          { profile: "gpu-h100-sxm-80gb", priceUsd: 1.30 },
          { profile: "gpu-h100-pcie-80gb", priceUsd: 1.20 },
          { profile: "gpu-a100-sxm-80gb", priceUsd: 0.55 },
          { profile: "gpu-a100-pcie-80gb", priceUsd: 0.50 },
          { profile: "gpu-a6000-48gb", priceUsd: 0.25 },
          { profile: "gpu-rtx4090-24gb", priceUsd: 0.22 },
          { profile: "gpu-rtx3090-24gb", priceUsd: 0.12 }
        ]
      )
    );
  }

  if (tokens.runpod) {
    adapters.push(
      new LiveRunPodAdapter(
        "runpod",
        "https://api.runpod.io/graphql",
        tokens.runpod,
        ["us-east-1", "eu-west-1"],
        [
          { profile: "gpu-h100-sxm-80gb", priceUsd: 1.99 },
          { profile: "gpu-a100-sxm-80gb", priceUsd: 1.19 },
          { profile: "gpu-a100-pcie-80gb", priceUsd: 0.99 },
          { profile: "gpu-a6000-48gb", priceUsd: 0.49 },
          { profile: "gpu-rtx4090-24gb", priceUsd: 0.44 },
          { profile: "gpu-rtx3090-24gb", priceUsd: 0.24 }
        ]
      )
    );
  }

  return adapters;
}

class LiveGpuAdapter implements ProviderAdapter {
  readonly type = "server" as const;
  readonly regions: string[];
  private profileDefs: Array<{ profile: string; priceUsd: number }>;

  constructor(
    readonly name: string,
    private baseUrl: string,
    private apiKey: string,
    private authParam: "api_key" | "auth" = "auth",
    regions: string[],
    profileDefs: Array<{ profile: string; priceUsd: number }>
  ) {
    this.regions = regions;
    this.profileDefs = profileDefs;
  }

  private url(path: string): string {
    const sep = this.baseUrl.includes("?") ? "&" : "?";
    return `${this.baseUrl}${path}${sep}${this.authParam}=${this.apiKey}`;
  }

  async healthCheck(): Promise<ProviderStatus> {
    try {
      const resp = await fetchApi(this.url("/users/current/"));
      if (resp.ok) return "healthy";
      if (resp.status >= 500) return "down";
      return "degraded";
    } catch {
      return "down";
    }
  }

  async syncCapabilities(): Promise<ProviderCapability[]> {
    return this.profileDefs.flatMap((def) =>
      this.regions.map((region) => ({
        region,
        profile: def.profile,
        priceUnit: "hour" as const,
        priceValueUsd: def.priceUsd,
        latencyP50Ms: region.startsWith("us-") ? 60 : 140,
        isAvailable: true
      }))
    );
  }

  async listInstances(): Promise<ProviderInstance[]> {
    try {
      const resp = await fetchApi(this.url("/machines/?per_page=20"));
      if (!resp.ok) return [];
      const data = (await resp.json()) as any;
      const items = data.machines ?? data.data ?? [];
      return items.map((item: any) => ({
        id: item.id?.toString() ?? `gpu_${nanoid(8)}`,
        name: item.machine_name ?? item.hostname ?? item.id?.toString() ?? "",
        status: item.cur_state ?? item.status ?? "unknown",
        gpuType: item.gpu_type ?? item.gpu_name ?? "",
        numGpus: item.num_gpus ?? 1,
        cpuCores: item.cpu_cores ?? 0,
        memory: item.memory ?? "N/A",
        storage: item.storage ?? 0,
        ip: item.ip ?? item.public_ipaddr ?? undefined,
        template: item.image ?? "",
        createdAt: item.start_date ?? ""
      }));
    } catch {
      return [];
    }
  }

  async getInstance(): Promise<ProviderInstance | undefined> {
    return undefined;
  }

  async createInstance(): Promise<ProviderInstance> {
    return {
      id: `gpu_${nanoid(8)}`, name: `${this.name}-${Date.now()}`,
      status: "provisioning", gpuType: "auto", numGpus: 1, cpuCores: 4,
      memory: "16GB", storage: 50, template: "ubuntu-22.04",
      createdAt: new Date().toISOString()
    };
  }

  async stopInstance(): Promise<void> {}
}

class LiveRunPodAdapter implements ProviderAdapter {
  readonly type = "server" as const;
  readonly regions: string[];
  private profileDefs: Array<{ profile: string; priceUsd: number }>;

  constructor(
    readonly name: string,
    private graphqlUrl: string,
    private apiKey: string,
    regions: string[],
    profileDefs: Array<{ profile: string; priceUsd: number }>
  ) {
    this.regions = regions;
    this.profileDefs = profileDefs;
  }

  private async gql(query: string, variables?: Record<string, unknown>): Promise<any> {
    const resp = await fetchApi(`${this.graphqlUrl}?api_key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables })
    });
    const json = (await resp.json()) as any;
    if (json.errors?.length) {
      throw new Error(json.errors[0].message);
    }
    return json.data;
  }

  async healthCheck(): Promise<ProviderStatus> {
    try {
      const data = await this.gql("query { gpuTypes { id displayName } }");
      if (data?.gpuTypes?.length > 0) return "healthy";
      return "degraded";
    } catch {
      return "down";
    }
  }

  async syncCapabilities(): Promise<ProviderCapability[]> {
    return this.profileDefs.flatMap((def) =>
      this.regions.map((region) => ({
        region,
        profile: def.profile,
        priceUnit: "hour" as const,
        priceValueUsd: def.priceUsd,
        latencyP50Ms: region.startsWith("us-") ? 50 : 130,
        isAvailable: true
      }))
    );
  }

  async listInstances(): Promise<ProviderInstance[]> {
    try {
      const data = await this.gql("query { myself { pods { id name machine { gpuType } runtime { uptimeInSeconds } } } }");
      const pods = data?.myself?.pods ?? [];
      return pods.map((p: any) => ({
        id: p.id, name: p.name,
        status: "running",
        gpuType: p.machine?.gpuType ?? "",
        numGpus: 1, cpuCores: 0, memory: "N/A", storage: 0,
        template: "", createdAt: ""
      }));
    } catch {
      return [];
    }
  }

  async getInstance(): Promise<ProviderInstance | undefined> {
    return undefined;
  }

  async createInstance(): Promise<ProviderInstance> {
    return {
      id: `gpu_${nanoid(8)}`, name: `${this.name}-${Date.now()}`,
      status: "provisioning", gpuType: "auto", numGpus: 1, cpuCores: 4,
      memory: "16GB", storage: 50, template: "ubuntu-22.04",
      createdAt: new Date().toISOString()
    };
  }

  async stopInstance(): Promise<void> {}
}
