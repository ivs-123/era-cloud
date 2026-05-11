export type ProviderType = "inference" | "server" | "edge" | "marketplace";
export type ProviderStatus = "healthy" | "degraded" | "down";
export type WorkloadKind = "inference" | "server" | "edge";
export type ProviderCategory = "gpu" | "cloud" | "inference" | "edge" | "marketplace";
export type RoutingPolicy = "cheapest" | "balanced" | "low-latency";
export type WorkloadState = "provisioning" | "running" | "stopping" | "stopped" | "failed";

export const SUPPORTED_PROVIDERS = [
  // GPU Cloud
  { id: "thunder-compute", name: "Thunder Compute", type: "server" as const, category: "gpu" },
  { id: "hetzner", name: "Hetzner Cloud", type: "server" as const, category: "gpu" },
  { id: "runpod", name: "RunPod", type: "server" as const, category: "gpu" },
  { id: "lambdalabs", name: "Lambda Labs", type: "server" as const, category: "gpu" },
  { id: "vultr", name: "Vultr", type: "server" as const, category: "gpu" },
  { id: "vastai", name: "Vast.ai", type: "server" as const, category: "gpu" },
  { id: "fluidstack", name: "FluidStack", type: "server" as const, category: "gpu" },
  { id: "massedcompute", name: "Massed Compute", type: "server" as const, category: "gpu" },
  // Big Cloud
  { id: "digitalocean", name: "DigitalOcean", type: "server" as const, category: "cloud" },
  { id: "linode", name: "Linode / Akamai", type: "server" as const, category: "cloud" },
  { id: "ovhcloud", name: "OVHcloud", type: "server" as const, category: "cloud" },
  { id: "aws", name: "Amazon Web Services", type: "server" as const, category: "cloud" },
  { id: "gcp", name: "Google Cloud", type: "server" as const, category: "cloud" },
  { id: "azure", name: "Microsoft Azure", type: "server" as const, category: "cloud" },
  { id: "oracle", name: "Oracle Cloud", type: "server" as const, category: "cloud" },
  { id: "ibm", name: "IBM Cloud", type: "server" as const, category: "cloud" },
  // Asian Cloud
  { id: "alibaba", name: "Alibaba Cloud", type: "server" as const, category: "cloud" },
  { id: "tencent", name: "Tencent Cloud", type: "server" as const, category: "cloud" },
  { id: "huawei", name: "Huawei Cloud", type: "server" as const, category: "cloud" },
  { id: "baidu", name: "Baidu Cloud", type: "server" as const, category: "cloud" },
  // Russian Cloud
  { id: "yandex-cloud", name: "Yandex Cloud", type: "server" as const, category: "cloud" },
  { id: "vk-cloud", name: "VK Cloud", type: "server" as const, category: "cloud" },
  { id: "sbercloud", name: "SberCloud", type: "server" as const, category: "cloud" },
  { id: "cloud-ru", name: "Cloud.ru", type: "server" as const, category: "cloud" },
  { id: "selectel", name: "Selectel", type: "server" as const, category: "cloud" },
  // Inference APIs
  { id: "deepinfra", name: "DeepInfra", type: "inference" as const, category: "inference" },
  { id: "together", name: "Together AI", type: "inference" as const, category: "inference" },
  { id: "groq", name: "Groq", type: "inference" as const, category: "inference" },
  { id: "lepton", name: "Lepton AI", type: "inference" as const, category: "inference" },
  { id: "cerebras", name: "Cerebras", type: "inference" as const, category: "inference" },
  { id: "sambanova", name: "SambaNova", type: "inference" as const, category: "inference" },
  { id: "openai", name: "OpenAI", type: "inference" as const, category: "inference" },
  { id: "anthropic", name: "Anthropic", type: "inference" as const, category: "inference" },
  { id: "fireworks", name: "Fireworks AI", type: "inference" as const, category: "inference" },
  { id: "deepl", name: "DeepL", type: "inference" as const, category: "inference" },
  { id: "assemblyai", name: "AssemblyAI", type: "inference" as const, category: "inference" },
  // Edge / CDN
  { id: "cloudflare", name: "Cloudflare", type: "edge" as const, category: "edge" },
  { id: "akamai", name: "Akamai", type: "edge" as const, category: "edge" },
  { id: "fastly", name: "Fastly", type: "edge" as const, category: "edge" },
  // Marketplaces
  { id: "github-marketplace", name: "GitHub Marketplace", type: "marketplace" as const, category: "marketplace" },
  { id: "vercel-marketplace", name: "Vercel Integrations", type: "marketplace" as const, category: "marketplace" }
] as const;

export interface ProviderCapability {
  region: string;
  profile: string;
  priceUnit: "hour" | "token" | "gb" | "1k_tokens";
  priceValueUsd: number;
  latencyP50Ms?: number;
  isAvailable: boolean;
}

export interface ProviderSummary {
  id: string;
  name: string;
  type: ProviderType;
  status: ProviderStatus;
  regions: string[];
  capabilities: string[];
}

export interface WorkloadCreateRequest {
  kind: WorkloadKind;
  profile: string;
  region: string;
  routing_policy: RoutingPolicy;
  max_hourly_cost_usd?: number;
  latency_target_ms?: number;
  metadata?: Record<string, string>;
}

export interface RoutingCandidate {
  provider_id: string;
  provider_name: string;
  score: number;
  estimated_hourly_cost_usd: number;
  latency_p50_ms: number;
  status: ProviderStatus;
}

export interface RoutingSimulationResponse {
  winner_provider_id: string;
  reason_code: string;
  ranked_candidates: RoutingCandidate[];
}
