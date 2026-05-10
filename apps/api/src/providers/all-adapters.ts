import type { ProviderCapability, ProviderStatus } from "@era/common";
import type { CreateInstanceParams, ProviderAdapter, ProviderInstance } from "./adapter.js";

function nanoid(len = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  let id = "";
  for (let i = 0; i < len; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function createBaseAdapter(
  name: string,
  regions: string[],
  profileDefs: Array<{ profile: string; regions?: string[]; priceUsd: number; latencyMs?: number }>
): ProviderAdapter {
  return {
    name,
    type: "server" as const,
    regions,

    healthCheck: async (): Promise<ProviderStatus> => "healthy",

    syncCapabilities: async (): Promise<ProviderCapability[]> => {
      return profileDefs.flatMap((def) =>
        (def.regions ?? regions).map((region) => ({
          region,
          profile: def.profile,
          priceUnit: "hour" as const,
          priceValueUsd: def.priceUsd,
          latencyP50Ms: def.latencyMs ?? 80,
          isAvailable: true
        }))
      );
    },

    listInstances: async (): Promise<ProviderInstance[]> => [],

    getInstance: async (): Promise<ProviderInstance | undefined> => undefined,

    createInstance: async (params: CreateInstanceParams): Promise<ProviderInstance> => ({
      id: `inst_${nanoid(10)}`,
      name: `${params.gpuType}-${Date.now()}`,
      status: "provisioning",
      gpuType: params.gpuType,
      numGpus: params.numGpus,
      cpuCores: params.cpuCores,
      memory: `${params.cpuCores * 4}GB`,
      storage: params.diskSizeGb,
      template: params.template,
      createdAt: new Date().toISOString()
    }),

    stopInstance: async (): Promise<void> => {}
  };
}

// ═══════════════════════════════════════════
// 🇪🇺 EUROPEAN PROVIDERS
// ═══════════════════════════════════════════

export const hetznerAdapter = createBaseAdapter(
  "hetzner",
  ["eu-central", "eu-west", "us-east", "us-west"],
  [
    { profile: "gpu-h100-80gb", priceUsd: 2.49 },
    { profile: "gpu-a100-80gb", priceUsd: 1.79 },
    { profile: "gpu-l40s-48gb", priceUsd: 1.19 },
    { profile: "compute-ccx53", priceUsd: 0.17 },
    { profile: "compute-ccx63", priceUsd: 0.34 }
  ]
);

export const runpodAdapter = createBaseAdapter(
  "runpod",
  ["us-east-1", "eu-west-1"],
  [
    { profile: "gpu-h100-sxm-80gb", priceUsd: 1.99 },
    { profile: "gpu-a100-sxm-80gb", priceUsd: 1.19 },
    { profile: "gpu-a100-pcie-80gb", priceUsd: 0.99 },
    { profile: "gpu-a6000-48gb", priceUsd: 0.49 },
    { profile: "gpu-rtx4090-24gb", priceUsd: 0.44 },
    { profile: "gpu-rtx3090-24gb", priceUsd: 0.24 },
    { profile: "serverless-inference", priceUsd: 0.0003 }
  ]
);

export const lambdalabsAdapter = createBaseAdapter(
  "lambdalabs",
  ["us-west-1", "us-east-1", "us-central-1"],
  [
    { profile: "gpu-h100-sxm-80gb", priceUsd: 1.99 },
    { profile: "gpu-h100-pcie-80gb", priceUsd: 1.79 },
    { profile: "gpu-a100-sxm-80gb", priceUsd: 1.10 },
    { profile: "gpu-a6000-48gb", priceUsd: 0.50 },
    { profile: "gpu-gh200", priceUsd: 3.29 }
  ]
);

export const vultrAdapter = createBaseAdapter(
  "vultr",
  [
    "us-east", "us-west", "us-southeast", "eu-west", "eu-central",
    "ap-south", "ap-southeast", "ap-east", "latam-north"
  ],
  [
    { profile: "gpu-h100-80gb", priceUsd: 2.60, regions: ["us-east", "eu-west"] },
    { profile: "gpu-a100-80gb", priceUsd: 1.79, regions: ["us-east", "eu-west", "ap-southeast"] },
    { profile: "gpu-l40s-48gb", priceUsd: 1.30, regions: ["us-east", "us-west", "eu-west"] },
    { profile: "compute-optimized", priceUsd: 0.12 },
    { profile: "compute-regular", priceUsd: 0.006 }
  ]
);

export const digitaloceanAdapter = createBaseAdapter(
  "digitalocean",
  ["nyc1", "nyc3", "sfo2", "sfo3", "ams3", "fra1", "lon1", "sgp1", "tor1", "blr1"],
  [
    { profile: "gpu-h100-80gb", priceUsd: 2.40, regions: ["nyc1", "sfo2", "ams3"] },
    { profile: "compute-premium-amd", priceUsd: 0.07 },
    { profile: "compute-premium-intel", priceUsd: 0.08 },
    { profile: "app-platform", priceUsd: 0.014 }
  ]
);

export const linodeAdapter = createBaseAdapter(
  "linode",
  ["us-east", "us-central", "us-west", "eu-west", "eu-central", "ap-south", "ap-southeast"],
  [
    { profile: "gpu-a100-80gb", priceUsd: 1.50, regions: ["us-east", "eu-west"] },
    { profile: "compute-dedicated-32gb", priceUsd: 0.21 },
    { profile: "compute-dedicated-64gb", priceUsd: 0.42 },
    { profile: "compute-shared-4gb", priceUsd: 0.036 }
  ]
);

// ═══════════════════════════════════════════
// 🇺🇸 AMERICAN BIG CLOUD
// ═══════════════════════════════════════════

export const awsAdapter = createBaseAdapter(
  "aws",
  [
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "eu-west-1", "eu-west-2", "eu-central-1", "eu-north-1",
    "ap-northeast-1", "ap-northeast-2", "ap-southeast-1", "ap-southeast-2",
    "ap-south-1", "sa-east-1", "me-south-1", "af-south-1"
  ],
  [
    { profile: "gpu-p5-h100-80gb", priceUsd: 3.06, regions: ["us-east-1", "us-west-2", "eu-west-1"] },
    { profile: "gpu-p4d-a100-40gb", priceUsd: 2.18, regions: ["us-east-1", "us-west-2", "eu-west-1", "ap-northeast-1"] },
    { profile: "gpu-g5-a10g-24gb", priceUsd: 0.53, regions: ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"] },
    { profile: "gpu-g6e-l40s-48gb", priceUsd: 1.07, regions: ["us-east-1", "us-west-2", "eu-west-1"] },
    { profile: "compute-c7g-arm", priceUsd: 0.13 },
    { profile: "compute-m7i-xlarge", priceUsd: 0.21 },
    { profile: "lambda-serverless", priceUsd: 0.0000167 }
  ]
);

export const gcpAdapter = createBaseAdapter(
  "gcp",
  [
    "us-east1", "us-east4", "us-west1", "us-central1",
    "europe-west1", "europe-west4", "europe-north1",
    "asia-east1", "asia-southeast1", "asia-south1",
    "australia-southeast1", "southamerica-east1"
  ],
  [
    { profile: "gpu-a3-h100-80gb", priceUsd: 2.84, regions: ["us-east4", "us-central1", "europe-west4"] },
    { profile: "gpu-a2-a100-40gb", priceUsd: 1.89, regions: ["us-central1", "europe-west4", "asia-east1"] },
    { profile: "gpu-g2-l4-24gb", priceUsd: 0.40, regions: ["us-east1", "us-central1", "europe-west1", "asia-east1"] },
    { profile: "compute-c3-highcpu", priceUsd: 0.05 },
    { profile: "compute-n2-standard", priceUsd: 0.09 },
    { profile: "cloud-run-serverless", priceUsd: 0.000018 }
  ]
);

export const azureAdapter = createBaseAdapter(
  "azure",
  [
    "eastus", "eastus2", "westus", "westus2", "westus3", "centralus", "southcentralus",
    "northeurope", "westeurope", "uksouth", "francecentral",
    "eastasia", "southeastasia", "japaneast", "australiaeast",
    "brazilsouth", "uaenorth"
  ],
  [
    { profile: "gpu-nc96-h100", priceUsd: 2.96, regions: ["eastus", "westus", "northeurope"] },
    { profile: "gpu-nc48-a100", priceUsd: 1.98, regions: ["eastus", "westeurope", "southeastasia"] },
    { profile: "gpu-nc24ads-a10", priceUsd: 0.62, regions: ["eastus", "westus", "northeurope"] },
    { profile: "compute-ds-v5", priceUsd: 0.096 },
    { profile: "compute-eas-v5-amd", priceUsd: 0.085 }
  ]
);

export const oracleAdapter = createBaseAdapter(
  "oracle",
  [
    "us-ashburn-1", "us-phoenix-1", "us-sanjose-1",
    "eu-frankfurt-1", "eu-amsterdam-1", "uk-london-1",
    "ap-tokyo-1", "ap-seoul-1", "ap-mumbai-1", "ap-sydney-1",
    "sa-saopaulo-1", "me-dubai-1"
  ],
  [
    { profile: "gpu-bm-a100-80gb", priceUsd: 1.60, regions: ["us-ashburn-1", "eu-frankfurt-1"] },
    { profile: "gpu-vm-gpu3-a10", priceUsd: 0.54, regions: ["us-ashburn-1", "eu-frankfurt-1", "ap-tokyo-1"] },
    { profile: "compute-e4-flex", priceUsd: 0.03 },
    { profile: "compute-ampere-a1-arm", priceUsd: 0.015 }
  ]
);

export const ibmAdapter = createBaseAdapter(
  "ibm",
  [
    "us-south", "us-east", "eu-de", "eu-gb", "jp-tok", "jp-osa", "au-syd",
    "ca-tor", "br-sao"
  ],
  [
    { profile: "gpu-h100-80gb", priceUsd: 2.70, regions: ["us-south", "eu-de"] },
    { profile: "gpu-a100-80gb", priceUsd: 1.80, regions: ["us-south", "eu-de", "jp-tok"] },
    { profile: "compute-bx2d", priceUsd: 0.12 },
    { profile: "compute-cx2", priceUsd: 0.08 }
  ]
);

// ═══════════════════════════════════════════
// 🇨🇳🇯🇵 ASIAN PROVIDERS
// ═══════════════════════════════════════════

export const alibabaAdapter = createBaseAdapter(
  "alibaba",
  [
    "cn-hangzhou", "cn-beijing", "cn-shanghai", "cn-shenzhen",
    "ap-southeast-1", "ap-southeast-2", "ap-southeast-3", "ap-southeast-5",
    "ap-northeast-1", "ap-south-1",
    "eu-central-1", "us-west-1", "me-east-1"
  ],
  [
    { profile: "gpu-ecs-h100-80gb", priceUsd: 2.20, regions: ["cn-hangzhou", "ap-southeast-1", "eu-central-1"] },
    { profile: "gpu-ecs-a100-80gb", priceUsd: 1.45, regions: ["cn-hangzhou", "cn-beijing", "ap-southeast-1"] },
    { profile: "gpu-ecs-v100-32gb", priceUsd: 0.85, regions: ["cn-hangzhou", "cn-shanghai", "ap-southeast-1"] },
    { profile: "gpu-ecs-t4-16gb", priceUsd: 0.35, regions: ["cn-hangzhou", "ap-southeast-1"] },
    { profile: "compute-ecs-g7", priceUsd: 0.07 },
    { profile: "compute-ecs-c7", priceUsd: 0.05 },
    { profile: "function-compute-serverless", priceUsd: 0.000016 }
  ]
);

export const tencentAdapter = createBaseAdapter(
  "tencent",
  [
    "ap-guangzhou", "ap-shanghai", "ap-beijing", "ap-chengdu", "ap-nanjing",
    "ap-hongkong", "ap-singapore", "ap-tokyo", "ap-seoul", "ap-bangkok", "ap-jakarta",
    "na-siliconvalley", "na-ashburn", "eu-frankfurt", "sa-saopaulo"
  ],
  [
    { profile: "gpu-hcc-h100", priceUsd: 2.10, regions: ["ap-guangzhou", "ap-singapore", "na-siliconvalley"] },
    { profile: "gpu-hcc-a100", priceUsd: 1.40, regions: ["ap-guangzhou", "ap-beijing", "ap-singapore"] },
    { profile: "gpu-gn10x-v100", priceUsd: 0.80, regions: ["ap-guangzhou", "ap-shanghai", "ap-singapore"] },
    { profile: "gpu-gn7-t4", priceUsd: 0.30, regions: ["ap-guangzhou", "ap-hongkong", "na-siliconvalley"] },
    { profile: "compute-cvm-s5", priceUsd: 0.06 },
    { profile: "compute-cvm-sa2-amd", priceUsd: 0.05 }
  ]
);

export const huaweiAdapter = createBaseAdapter(
  "huawei",
  [
    "cn-north-1", "cn-north-4", "cn-east-2", "cn-east-3", "cn-south-1", "cn-southwest-2",
    "ap-singapore", "ap-bangkok", "ap-jakarta",
    "af-johannesburg", "la-mexico-city-1", "sa-brazil-1"
  ],
  [
    { profile: "gpu-p2vs-a100", priceUsd: 1.40, regions: ["cn-north-4", "ap-singapore"] },
    { profile: "gpu-p2vs-v100", priceUsd: 0.78, regions: ["cn-north-4", "cn-east-2", "ap-singapore"] },
    { profile: "gpu-ascend-910", priceUsd: 1.10, regions: ["cn-north-4", "cn-south-1"] },
    { profile: "compute-ecs-s6", priceUsd: 0.06 },
    { profile: "compute-ecs-c6", priceUsd: 0.08 }
  ]
);

export const baiduAdapter = createBaseAdapter(
  "baidu",
  [
    "cn-beijing", "cn-shanghai", "cn-guangzhou",
    "ap-singapore", "ap-hongkong"
  ],
  [
    { profile: "gpu-a100-80gb", priceUsd: 1.35, regions: ["cn-beijing", "cn-shanghai"] },
    { profile: "gpu-v100-32gb", priceUsd: 0.77, regions: ["cn-beijing", "ap-singapore"] },
    { profile: "compute-bcc-g5", priceUsd: 0.06 }
  ]
);

// ═══════════════════════════════════════════
// 🇷🇺 RUSSIAN PROVIDERS
// ═══════════════════════════════════════════

export const yandexCloudAdapter = createBaseAdapter(
  "yandex-cloud",
  ["ru-central1-a", "ru-central1-b", "ru-central1-c", "ru-central1-d"],
  [
    { profile: "gpu-a100-80gb", priceUsd: 1.15 },
    { profile: "gpu-h100-80gb", priceUsd: 1.95 },
    { profile: "gpu-v100-32gb", priceUsd: 0.85 },
    { profile: "gpu-t4-16gb", priceUsd: 0.40 },
    { profile: "compute-standard-intel", priceUsd: 0.045 },
    { profile: "compute-memory-amd", priceUsd: 0.065 },
    { profile: "compute-gpu-preemptible", priceUsd: 0.55 },
    { profile: "serverless-functions", priceUsd: 0.000014 }
  ]
);

export const vkcloudAdapter = createBaseAdapter(
  "vk-cloud",
  ["ru-msk", "ru-spb", "ru-nsk"],
  [
    { profile: "gpu-a100-80gb", priceUsd: 1.10, regions: ["ru-msk"] },
    { profile: "gpu-v100-32gb", priceUsd: 0.79, regions: ["ru-msk", "ru-spb"] },
    { profile: "gpu-t4-16gb", priceUsd: 0.38, regions: ["ru-msk", "ru-spb"] },
    { profile: "compute-standard", priceUsd: 0.042 },
    { profile: "compute-highfreq", priceUsd: 0.058 }
  ]
);

export const sbercloudAdapter = createBaseAdapter(
  "sbercloud",
  ["ru-central"],
  [
    { profile: "gpu-a100-80gb", priceUsd: 1.12 },
    { profile: "gpu-v100-32gb", priceUsd: 0.76 },
    { profile: "gpu-h100-80gb", priceUsd: 1.88 },
    { profile: "compute-s6", priceUsd: 0.043 },
    { profile: "compute-m6", priceUsd: 0.062 },
    { profile: "ml-arena-gpu", priceUsd: 0.39 }
  ]
);

export const cloudruAdapter = createBaseAdapter(
  "cloud-ru",
  ["ru-central1", "ru-west1", "ru-east1"],
  [
    { profile: "gpu-a100-80gb", priceUsd: 1.18, regions: ["ru-central1"] },
    { profile: "gpu-t4-16gb", priceUsd: 0.42, regions: ["ru-central1", "ru-west1"] },
    { profile: "compute-advanced", priceUsd: 0.048 },
    { profile: "compute-standard", priceUsd: 0.038 }
  ]
);

export const selectelAdapter = createBaseAdapter(
  "selectel",
  ["ru-1", "ru-2", "ru-3", "kz-1"],
  [
    { profile: "gpu-a100-80gb", priceUsd: 1.14, regions: ["ru-1", "kz-1"] },
    { profile: "gpu-h100-80gb", priceUsd: 1.89, regions: ["ru-1"] },
    { profile: "gpu-t4-16gb", priceUsd: 0.39 },
    { profile: "compute-srv-8vcpu", priceUsd: 0.09 },
    { profile: "compute-srv-16vcpu", priceUsd: 0.17 }
  ]
);

// ═══════════════════════════════════════════
// ALL ADAPTERS REGISTRY
// ═══════════════════════════════════════════

export const allProviderAdapters: ProviderAdapter[] = [
  // EU
  hetznerAdapter,
  runpodAdapter,
  lambdalabsAdapter,
  vultrAdapter,
  digitaloceanAdapter,
  linodeAdapter,
  // US
  awsAdapter,
  gcpAdapter,
  azureAdapter,
  oracleAdapter,
  ibmAdapter,
  // Asia
  alibabaAdapter,
  tencentAdapter,
  huaweiAdapter,
  baiduAdapter,
  // RU
  yandexCloudAdapter,
  vkcloudAdapter,
  sbercloudAdapter,
  cloudruAdapter,
  selectelAdapter
];

export const adapterSummary = allProviderAdapters.map((a) => ({
  name: a.name,
  regions: a.regions.length,
  capabilities: 0
}));
