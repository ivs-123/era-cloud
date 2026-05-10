import type { ProviderCapability, ProviderStatus } from "@era/common";
import type { CreateInstanceParams, ProviderAdapter, ProviderInstance } from "./adapter.js";

interface ThunderConfig {
  apiUrl: string;
  apiToken: string;
}

export class ThunderComputeAdapter implements ProviderAdapter {
  readonly name = "thunder-compute";
  readonly type = "server" as const;
  readonly regions = ["us-east-1", "eu-west-1"];

  private config: ThunderConfig;

  constructor(config: ThunderConfig) {
    this.config = config;
  }

  async healthCheck(): Promise<ProviderStatus> {
    try {
      const response = await this.request("/specs");
      if (response.ok) {
        return "healthy";
      }

      if (response.status >= 500) {
        return "down";
      }

      return "degraded";
    } catch {
      return "down";
    }
  }

  async syncCapabilities(): Promise<ProviderCapability[]> {
    const [pricing, specs, templates] = await Promise.all([
      this.request("/pricing").then((r) => r.json() as Promise<{ pricing: Record<string, number> }>),
      this.request("/specs").then((r) => r.json() as Promise<{ specs: Record<string, ThunderSpec> }>),
      this.request("/thunder-templates").then((r) => r.json() as Promise<Record<string, ThunderTemplate>>)
    ]);

    const capabilities: ProviderCapability[] = [];

    for (const [specKey, spec] of Object.entries(specs.specs)) {
      const mode = spec.mode as string;
      const priceKey = specKey;
      const priceValueUsd = pricing.pricing[priceKey] ?? 0;

      if (priceValueUsd <= 0) {
        continue;
      }

      for (const region of this.regions) {
        for (const templateName of Object.keys(templates)) {
          capabilities.push({
            region,
            profile: `${spec.displayName.replace(/\s+/g, "-").toLowerCase()}_${templateName}_${mode}`,
            priceUnit: "hour",
            priceValueUsd,
            latencyP50Ms: region === "us-east-1" ? 40 : 120,
            isAvailable: true
          });
        }
      }
    }

    return capabilities;
  }

  async listInstances(): Promise<ProviderInstance[]> {
    const response = await this.request("/instances/list");
    const data = (await response.json()) as Record<string, ThunderInstanceItem>;

    return Object.entries(data).map(([id, item]) => ({
      id,
      name: item.name ?? id,
      status: item.status ?? "unknown",
      gpuType: item.gpuType ?? "",
      numGpus: Number(item.numGpus ?? 0),
      cpuCores: Number(item.cpuCores ?? 0),
      memory: item.memory ?? "",
      storage: item.storage ?? 0,
      ip: item.ip,
      template: item.template ?? "",
      createdAt: item.createdAt ?? ""
    }));
  }

  async getInstance(id: string): Promise<ProviderInstance | undefined> {
    const instances = await this.listInstances();
    return instances.find((instance) => instance.id === id);
  }

  async createInstance(params: CreateInstanceParams): Promise<ProviderInstance> {
    const body: Record<string, unknown> = {
      gpu_type: params.gpuType,
      num_gpus: params.numGpus,
      cpu_cores: params.cpuCores,
      disk_size_gb: params.diskSizeGb,
      template: params.template,
      mode: params.mode
    };

    if (params.publicKey) {
      body.public_key = params.publicKey;
    }

    const response = await this.request("/instances/create", {
      method: "POST",
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(`Thunder Compute: ${error.error ?? response.statusText}`);
    }

    const result = (await response.json()) as ThunderCreateResponse;

    return {
      id: result.id ?? "",
      name: result.name ?? result.id ?? "",
      status: "provisioning",
      gpuType: params.gpuType,
      numGpus: params.numGpus,
      cpuCores: params.cpuCores,
      memory: "",
      storage: params.diskSizeGb,
      template: params.template,
      createdAt: new Date().toISOString()
    };
  }

  async stopInstance(id: string): Promise<void> {
    const response = await this.request(`/instances/${id}/delete`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(`Thunder Compute: ${error.error ?? response.statusText}`);
    }
  }

  private async request(path: string, options?: RequestInit): Promise<Response> {
    const url = `${this.config.apiUrl}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.config.apiToken}`,
        "Content-Type": "application/json",
        ...options?.headers
      }
    });

    return response;
  }
}

interface ThunderSpec {
  displayName: string;
  vramGB: number;
  gpuCount: number;
  mode: string;
  vcpuOptions: number[];
  ramPerVCPUGiB: number;
  storageGB: {
    min: number;
    max: number;
  };
}

interface ThunderTemplate {
  displayName: string;
  extendedDescription: string;
  openPorts: number[];
  startupCommands: string[];
  automountFolders: string[];
}

interface ThunderInstanceItem {
  id?: string;
  name?: string;
  status?: string;
  ip?: string;
  port?: number;
  gpuType?: string;
  numGpus?: string;
  cpuCores?: string;
  memory?: string;
  storage?: number;
  template?: string;
  mode?: string;
  httpPorts?: number[];
  sshPublicKeys?: string[];
  createdAt?: string;
  uuid?: string;
}

interface ThunderCreateResponse {
  id?: string;
  name?: string;
  status?: string;
}
