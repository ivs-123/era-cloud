import type { ProviderCapability, ProviderStatus, ProviderType } from "@era/common";

export interface ProviderInstance {
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

export interface ProviderAdapter {
  readonly name: string;
  readonly type: ProviderType;
  readonly regions: string[];
  readonly category?: "gpu" | "cloud" | "inference" | "edge" | "marketplace";

  healthCheck(): Promise<ProviderStatus>;
  syncCapabilities(): Promise<ProviderCapability[]>;

  listInstances(): Promise<ProviderInstance[]>;
  getInstance(id: string): Promise<ProviderInstance | undefined>;
  createInstance(params: CreateInstanceParams): Promise<ProviderInstance>;
  stopInstance(id: string): Promise<void>;
}

export interface CreateInstanceParams {
  gpuType: string;
  numGpus: number;
  cpuCores: number;
  diskSizeGb: number;
  template: string;
  region: string;
  mode: string;
  publicKey?: string;
}
