import type { ProviderCapability, ProviderStatus } from "@era/common";
import type { CreateInstanceParams, ProviderAdapter, ProviderInstance } from "./adapter.js";

type ProviderConfig = Record<string, string>;

function createLazyAdapter(
  name: string,
  regions: string[],
  profiles: string[]
): () => ProviderAdapter {
  return () => ({
    name,
    type: "server" as const,
    regions,
    healthCheck: async (): Promise<ProviderStatus> => "healthy",
    syncCapabilities: async (): Promise<ProviderCapability[]> => {
      return regions.flatMap((region) =>
        profiles.map((profile) => ({
          region,
          profile,
          priceUnit: "hour" as const,
          priceValueUsd: 0,
          latencyP50Ms: 100,
          isAvailable: true
        }))
      );
    },
    listInstances: async (): Promise<ProviderInstance[]> => [],
    getInstance: async (): Promise<ProviderInstance | undefined> => undefined,
    createInstance: async (params: CreateInstanceParams): Promise<ProviderInstance> => ({
      id: `inst_${Date.now()}`,
      name: `${params.gpuType}-${params.template}`,
      status: "provisioning",
      gpuType: params.gpuType,
      numGpus: params.numGpus,
      cpuCores: params.cpuCores,
      memory: "",
      storage: params.diskSizeGb,
      template: params.template,
      createdAt: new Date().toISOString()
    }),
    stopInstance: async (): Promise<void> => {}
  });
}

export const gcpAdapterFactory = createLazyAdapter("gcp", [
  "us-east1",
  "us-west1",
  "europe-west1",
  "asia-east1"
], [
  "gpu-a100",
  "gpu-h100",
  "gpu-l4",
  "n2-standard"
]);

export const awsAdapterFactory = createLazyAdapter("aws", [
  "us-east-1",
  "us-west-2",
  "eu-west-1",
  "ap-southeast-1"
], [
  "gpu-p4d",
  "gpu-p5",
  "gpu-g5",
  "ec2-c7g"
]);

export const alibabaAdapterFactory = createLazyAdapter("alibaba", [
  "cn-hangzhou",
  "cn-beijing",
  "ap-southeast-1",
  "eu-central-1"
], [
  "gpu-v100",
  "gpu-a100",
  "ecs-g7"
]);

export const oracleAdapterFactory = createLazyAdapter("oracle", [
  "us-ashburn-1",
  "eu-frankfurt-1",
  "ap-tokyo-1"
], [
  "gpu-a10",
  "gpu-a100",
  "vm-standard"
]);

export const cloudruAdapterFactory = createLazyAdapter("cloud-ru", [
  "ru-central1",
  "ru-west1"
], [
  "gpu-a100",
  "gpu-t4",
  "vm-standard"
]);

export const selectelAdapterFactory = createLazyAdapter("selectel", [
  "ru-1",
  "ru-2",
  "ru-3"
], [
  "gpu-a100",
  "gpu-h100",
  "vm-standard"
]);

export const yandexCloudAdapterFactory = createLazyAdapter("yandex-cloud", [
  "ru-central1-a",
  "ru-central1-b",
  "ru-central1-c"
], [
  "gpu-a100",
  "gpu-h100",
  "gpu-v100",
  "compute-standard"
]);

export const allPlannedAdapters: Array<{ name: string; factory: (config: ProviderConfig) => ProviderAdapter }> = [
  { name: "gcp", factory: () => gcpAdapterFactory() },
  { name: "aws", factory: () => awsAdapterFactory() },
  { name: "alibaba", factory: () => alibabaAdapterFactory() },
  { name: "oracle", factory: () => oracleAdapterFactory() },
  { name: "cloud-ru", factory: () => cloudruAdapterFactory() },
  { name: "selectel", factory: () => selectelAdapterFactory() },
  { name: "yandex-cloud", factory: () => yandexCloudAdapterFactory() }
];
