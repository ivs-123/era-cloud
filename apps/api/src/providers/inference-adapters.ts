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

function createInferenceAdapter(
  name: string,
  models: Array<{
    profile: string;
    pricePer1kTokens: number;
    pricePer1mTokens?: number;
    regions?: string[];
  }>
): ProviderAdapter {
  const regions = [...new Set(models.flatMap((m) => m.regions ?? ["global"]))];

  return {
    name,
    type: "inference" as const,
    category: "inference",
    regions,

    healthCheck: async (): Promise<ProviderStatus> => "healthy",

    syncCapabilities: async (): Promise<ProviderCapability[]> => {
      return models.flatMap((m) =>
        (m.regions ?? ["global"]).map((region) => ({
          region,
          profile: m.profile,
          priceUnit: "1k_tokens" as const,
          priceValueUsd: m.pricePer1kTokens,
          latencyP50Ms: m.pricePer1mTokens ? 100 : 200,
          isAvailable: true
        }))
      );
    },

    listInstances: async (): Promise<ProviderInstance[]> => [],
    getInstance: async (): Promise<ProviderInstance | undefined> => undefined,

    createInstance: async (): Promise<ProviderInstance> => ({
      id: `inf_${nanoid(8)}`,
      name: `${name}-endpoint`,
      status: "running",
      gpuType: "api",
      numGpus: 0,
      cpuCores: 0,
      memory: "N/A",
      storage: 0,
      template: "serverless",
      createdAt: new Date().toISOString()
    }),

    stopInstance: async (): Promise<void> => {}
  };
}

function createEdgeAdapter(
  name: string,
  pops: string[],
  services: string[]
): ProviderAdapter {
  return {
    name,
    type: "edge" as const,
    category: "edge",
    regions: pops,

    healthCheck: async (): Promise<ProviderStatus> => "healthy",

    syncCapabilities: async (): Promise<ProviderCapability[]> => {
      return services.flatMap((svc) =>
        pops.map((region) => ({
          region,
          profile: svc,
          priceUnit: "gb" as const,
          priceValueUsd: svc === "workers" ? 0.00005 : 0.01,
          latencyP50Ms: 5,
          isAvailable: true
        }))
      );
    },

    listInstances: async (): Promise<ProviderInstance[]> => [],
    getInstance: async (): Promise<ProviderInstance | undefined> => undefined,
    createInstance: async (): Promise<ProviderInstance> => ({
      id: `edge_${nanoid(8)}`, name: `${name}-pop`, status: "running",
      gpuType: "edge", numGpus: 0, cpuCores: 0, memory: "N/A", storage: 0,
      template: "edge", createdAt: new Date().toISOString()
    }),
    stopInstance: async (): Promise<void> => {}
  };
}

// ═══════════════════════════════════════════
// 🧠 INFERENCE API PROVIDERS (per-token pricing)
// ═══════════════════════════════════════════

export const deepinfraAdapter = createInferenceAdapter("deepinfra", [
  { profile: "llama-3.3-70b", pricePer1kTokens: 0.00035, pricePer1mTokens: 0.35 },
  { profile: "llama-3.1-8b", pricePer1kTokens: 0.00006, pricePer1mTokens: 0.06 },
  { profile: "mixtral-8x22b", pricePer1kTokens: 0.00045, pricePer1mTokens: 0.45 },
  { profile: "deepseek-r1", pricePer1kTokens: 0.00055, pricePer1mTokens: 0.55 },
  { profile: "deepseek-v3", pricePer1kTokens: 0.00027, pricePer1mTokens: 0.27 },
  { profile: "qwen-2.5-72b", pricePer1kTokens: 0.00035, pricePer1mTokens: 0.35 },
  { profile: "whisper-large-v3", pricePer1kTokens: 0.00012 },
  { profile: "sd-xl", pricePer1kTokens: 0.0015 }
]);

export const togetherAdapter = createInferenceAdapter("together", [
  { profile: "llama-3.3-70b", pricePer1kTokens: 0.00040, pricePer1mTokens: 0.40 },
  { profile: "llama-3.1-405b", pricePer1kTokens: 0.00180, pricePer1mTokens: 1.80 },
  { profile: "mixtral-8x22b", pricePer1kTokens: 0.00050, pricePer1mTokens: 0.50 },
  { profile: "deepseek-r1", pricePer1kTokens: 0.00060, pricePer1mTokens: 0.60 },
  { profile: "qwen-2.5-72b", pricePer1kTokens: 0.00038, pricePer1mTokens: 0.38 },
  { profile: "gemma-2-27b", pricePer1kTokens: 0.00015, pricePer1mTokens: 0.15 },
  { profile: "flux-schnell", pricePer1kTokens: 0.003 },
  { profile: "whisper-large-v3", pricePer1kTokens: 0.00010 }
]);

export const groqAdapter = createInferenceAdapter("groq", [
  { profile: "llama-3.3-70b-specdec", pricePer1kTokens: 0.00059, pricePer1mTokens: 0.59 },
  { profile: "llama-3.1-8b-instant", pricePer1kTokens: 0.00005, pricePer1mTokens: 0.05 },
  { profile: "mixtral-8x7b", pricePer1kTokens: 0.00024, pricePer1mTokens: 0.24 },
  { profile: "gemma-2-9b", pricePer1kTokens: 0.00010, pricePer1mTokens: 0.10 },
  { profile: "deepseek-r1-distill-llama-70b", pricePer1kTokens: 0.00059, pricePer1mTokens: 0.59 },
  { profile: "whisper-large-v3", pricePer1kTokens: 0.00008 }
]);

export const leptonAdapter = createInferenceAdapter("lepton", [
  { profile: "llama-3.3-70b", pricePer1kTokens: 0.00032, pricePer1mTokens: 0.32 },
  { profile: "mixtral-8x7b", pricePer1kTokens: 0.00020, pricePer1mTokens: 0.20 },
  { profile: "deepseek-r1", pricePer1kTokens: 0.00055, pricePer1mTokens: 0.55 },
  { profile: "qwen-2.5-32b", pricePer1kTokens: 0.00018, pricePer1mTokens: 0.18 }
]);

export const cerebrasAdapter = createInferenceAdapter("cerebras", [
  { profile: "llama-3.3-70b", pricePer1kTokens: 0.00060, pricePer1mTokens: 0.60 },
  { profile: "llama-3.1-8b", pricePer1kTokens: 0.00010, pricePer1mTokens: 0.10 },
  { profile: "llama-3.1-405b", pricePer1kTokens: 0.00200, pricePer1mTokens: 2.00 },
  { profile: "mixtral-8x7b", pricePer1kTokens: 0.00025, pricePer1mTokens: 0.25 }
]);

export const sambanovaAdapter = createInferenceAdapter("sambanova", [
  { profile: "llama-3.1-405b", pricePer1kTokens: 0.00190, pricePer1mTokens: 1.90 },
  { profile: "llama-3.3-70b", pricePer1kTokens: 0.00055, pricePer1mTokens: 0.55 },
  { profile: "deepseek-r1", pricePer1kTokens: 0.00065, pricePer1mTokens: 0.65 },
  { profile: "llama-3.1-8b", pricePer1kTokens: 0.00008, pricePer1mTokens: 0.08 }
]);

export const deeplAdapter = createInferenceAdapter("deepl", [
  { profile: "translate-text", pricePer1kTokens: 0.00002, pricePer1mTokens: 0.02 },
  { profile: "translate-document", pricePer1kTokens: 0.00003, pricePer1mTokens: 0.03 },
  { profile: "write-pro", pricePer1kTokens: 0.00005, pricePer1mTokens: 0.05 }
]);

export const assemblyaiAdapter = createInferenceAdapter("assemblyai", [
  { profile: "speech-to-text-best", pricePer1kTokens: 0.00240 },
  { profile: "speech-to-text-nano", pricePer1kTokens: 0.00010 },
  { profile: "speech-to-text-transcribe", pricePer1kTokens: 0.00130 }
]);

export const openaiAdapter = createInferenceAdapter("openai", [
  { profile: "gpt-4o", pricePer1kTokens: 0.00250, pricePer1mTokens: 2.50 },
  { profile: "gpt-4o-mini", pricePer1kTokens: 0.00015, pricePer1mTokens: 0.15 },
  { profile: "gpt-4.1", pricePer1kTokens: 0.00300, pricePer1mTokens: 3.00 },
  { profile: "o3-mini", pricePer1kTokens: 0.00060, pricePer1mTokens: 0.60 },
  { profile: "gpt-4.1-nano", pricePer1kTokens: 0.00008, pricePer1mTokens: 0.08 },
  { profile: "whisper-1", pricePer1kTokens: 0.00010 },
  { profile: "tts-1-hd", pricePer1kTokens: 0.00015 }
]);

export const anthropicAdapter = createInferenceAdapter("anthropic", [
  { profile: "claude-opus-4", pricePer1kTokens: 0.015, pricePer1mTokens: 15.00 },
  { profile: "claude-sonnet-4", pricePer1kTokens: 0.003, pricePer1mTokens: 3.00 },
  { profile: "claude-haiku-3.5", pricePer1kTokens: 0.00080, pricePer1mTokens: 0.80 }
]);

export const fireworksAdapter = createInferenceAdapter("fireworks", [
  { profile: "llama-3.3-70b", pricePer1kTokens: 0.00038, pricePer1mTokens: 0.38 },
  { profile: "mixtral-8x22b", pricePer1kTokens: 0.00042, pricePer1mTokens: 0.42 },
  { profile: "deepseek-r1", pricePer1kTokens: 0.00050, pricePer1mTokens: 0.50 },
  { profile: "qwen-2.5-72b", pricePer1kTokens: 0.00030, pricePer1mTokens: 0.30 },
  { profile: "stable-diffusion-3.5", pricePer1kTokens: 0.004 }
]);

// ═══════════════════════════════════════════
// 🏗️ P2P / SPOT GPU MARKETPLACES
// ═══════════════════════════════════════════

export const vastaiAdapter = createBaseInferenceAdapter("vastai", [
  { profile: "gpu-a100-sxm-80gb", priceUsd: 0.55, regions: ["us-east", "eu-west"] },
  { profile: "gpu-h100-sxm-80gb", priceUsd: 1.30, regions: ["us-east", "eu-west"] },
  { profile: "gpu-rtx4090-24gb", priceUsd: 0.25, regions: ["us-east", "eu-west", "ap-east"] },
  { profile: "gpu-rtx3090-24gb", priceUsd: 0.15, regions: ["us-east", "eu-west", "ap-east"] },
  { profile: "gpu-a6000-48gb", priceUsd: 0.30, regions: ["us-east", "eu-west"] }
]);

export const fluidstackAdapter = createBaseInferenceAdapter("fluidstack", [
  { profile: "gpu-h100-sxm-80gb", priceUsd: 1.45, regions: ["us-east", "eu-west", "ap-southeast"] },
  { profile: "gpu-a100-sxm-80gb", priceUsd: 0.65, regions: ["us-east", "eu-west", "ap-southeast"] },
  { profile: "gpu-rtx4090-24gb", priceUsd: 0.30, regions: ["us-east", "eu-west"] },
  { profile: "gpu-h100-nvl-188gb", priceUsd: 2.10, regions: ["us-east"] }
]);

export const massedcomputeAdapter = createBaseInferenceAdapter("massedcompute", [
  { profile: "gpu-h100-sxm-80gb", priceUsd: 1.35, regions: ["us-east", "us-west"] },
  { profile: "gpu-a100-sxm-80gb", priceUsd: 0.60, regions: ["us-east", "us-west"] },
  { profile: "gpu-rtx4090-24gb", priceUsd: 0.28, regions: ["us-east", "us-west"] }
]);

export const ovhcloudAdapter = createBaseInferenceAdapter("ovhcloud", [
  { profile: "gpu-h100-80gb", priceUsd: 2.55, regions: ["eu-west", "eu-central", "ca-east"] },
  { profile: "gpu-a100-80gb", priceUsd: 1.85, regions: ["eu-west", "eu-central", "ca-east"] },
  { profile: "gpu-l40s-48gb", priceUsd: 1.25, regions: ["eu-west", "eu-central"] },
  { profile: "compute-b3", priceUsd: 0.09, regions: ["eu-west", "eu-central", "ca-east", "ap-southeast"] }
]);

// ═══════════════════════════════════════════
// 🌐 EDGE / CDN PROVIDERS
// ═══════════════════════════════════════════

export const cloudflareAdapter = createEdgeAdapter("cloudflare", [
  "global-iad", "global-ams", "global-nrt", "global-sin",
  "global-lhr", "global-fra", "global-syd", "global-gru",
  "global-bom", "global-dxb", "global-cpt", "global-mow"
], [
  "workers-edge", "ai-gateway", "r2-storage", "d1-database",
  "vectorize", "browser-rendering"
]);

export const akamaiAdapter = createEdgeAdapter("akamai", [
  "na-east", "na-west", "eu-west", "eu-east", "ap-north", "ap-south", "latam-east"
], [
  "edge-compute", "image-manager", "bot-manager", "ion-performance"
]);

export const fastlyAdapter = createEdgeAdapter("fastly", [
  "us-east", "us-west", "eu-west", "eu-central", "ap-northeast", "ap-southeast", "sa-east"
], [
  "compute-edge", "waf-edge", "image-optimizer", "edge-dictionary"
]);

// ═══════════════════════════════════════════
// 🏪 MARKETPLACE / DISTRIBUTION
// ═══════════════════════════════════════════

export const githubAdapter: ProviderAdapter = {
  name: "github-marketplace",
  type: "marketplace" as const,
  category: "marketplace",
  regions: ["global"],
  healthCheck: async (): Promise<ProviderStatus> => "healthy",
  syncCapabilities: async (): Promise<ProviderCapability[]> => [{
    region: "global", profile: "github-app", priceUnit: "hour",
    priceValueUsd: 0, latencyP50Ms: 0, isAvailable: true
  }],
  listInstances: async (): Promise<ProviderInstance[]> => [],
  getInstance: async (): Promise<ProviderInstance | undefined> => undefined,
  createInstance: async (): Promise<ProviderInstance> => ({
    id: "gh_install", name: "GitHub App", status: "active",
    gpuType: "marketplace", numGpus: 0, cpuCores: 0, memory: "N/A",
    storage: 0, template: "app", createdAt: new Date().toISOString()
  }),
  stopInstance: async (): Promise<void> => {}
};

export const vercelAdapter: ProviderAdapter = {
  name: "vercel-marketplace",
  type: "marketplace" as const,
  category: "marketplace",
  regions: ["global"],
  healthCheck: async (): Promise<ProviderStatus> => "healthy",
  syncCapabilities: async (): Promise<ProviderCapability[]> => [{
    region: "global", profile: "vercel-integration", priceUnit: "hour",
    priceValueUsd: 0, latencyP50Ms: 0, isAvailable: true
  }],
  listInstances: async (): Promise<ProviderInstance[]> => [],
  getInstance: async (): Promise<ProviderInstance | undefined> => undefined,
  createInstance: async (): Promise<ProviderInstance> => ({
    id: "vc_install", name: "Vercel Integration", status: "active",
    gpuType: "marketplace", numGpus: 0, cpuCores: 0, memory: "N/A",
    storage: 0, template: "integration", createdAt: new Date().toISOString()
  }),
  stopInstance: async (): Promise<void> => {}
};

// ═══════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════

function createBaseInferenceAdapter(
  name: string,
  profiles: Array<{ profile: string; priceUsd: number; regions?: string[] }>,
  defaultRegions: string[] = ["us-east", "eu-west"]
): ProviderAdapter {
  return {
    name,
    type: "server" as const,
    category: "gpu",
    regions: [...new Set(profiles.flatMap((p) => p.regions ?? defaultRegions))],

    healthCheck: async (): Promise<ProviderStatus> => "healthy",

    syncCapabilities: async (): Promise<ProviderCapability[]> => {
      return profiles.flatMap((def) =>
        (def.regions ?? defaultRegions).map((region) => ({
          region,
          profile: def.profile,
          priceUnit: "hour" as const,
          priceValueUsd: def.priceUsd,
          latencyP50Ms: 80,
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
// ALL NEW ADAPTERS EXPORT
// ═══════════════════════════════════════════

export const inferenceAdapters: ProviderAdapter[] = [
  deepinfraAdapter,
  togetherAdapter,
  groqAdapter,
  leptonAdapter,
  cerebrasAdapter,
  sambanovaAdapter,
  deeplAdapter,
  assemblyaiAdapter,
  openaiAdapter,
  anthropicAdapter,
  fireworksAdapter,
  vastaiAdapter,
  fluidstackAdapter,
  massedcomputeAdapter,
  ovhcloudAdapter
];

export const edgeAdapters: ProviderAdapter[] = [
  cloudflareAdapter,
  akamaiAdapter,
  fastlyAdapter
];

export const marketplaceAdapters: ProviderAdapter[] = [
  githubAdapter,
  vercelAdapter
];
