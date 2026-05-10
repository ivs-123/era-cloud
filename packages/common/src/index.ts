export type ProviderType = "inference" | "server";
export type ProviderStatus = "healthy" | "degraded" | "down";
export type WorkloadKind = "inference" | "server";
export type RoutingPolicy = "cheapest" | "balanced" | "low-latency";
export type WorkloadState = "provisioning" | "running" | "stopping" | "stopped" | "failed";

export const SUPPORTED_PROVIDERS = [
  { id: "thunder-compute", name: "Thunder Compute", type: "server" as const, category: "gpu" },
  { id: "gcp", name: "Google Cloud", type: "server" as const, category: "cloud" },
  { id: "aws", name: "Amazon Web Services", type: "server" as const, category: "cloud" },
  { id: "alibaba", name: "Alibaba Cloud", type: "server" as const, category: "cloud" },
  { id: "oracle", name: "Oracle Cloud", type: "server" as const, category: "cloud" },
  { id: "cloud-ru", name: "Cloud.ru", type: "server" as const, category: "cloud" },
  { id: "selectel", name: "Selectel", type: "server" as const, category: "cloud" },
  { id: "yandex-cloud", name: "Yandex Cloud", type: "server" as const, category: "cloud" }
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
