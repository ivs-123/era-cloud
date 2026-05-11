import type {
  RoutingCandidate,
  RoutingPolicy,
  RoutingSimulationResponse,
  WorkloadKind
} from "@era/common";
import type { ProviderRecord } from "../storage/store.js";
import { normalizeProfile } from "./gpu-normalizer.js";

interface RoutingRequest {
  kind: WorkloadKind;
  profile: string;
  region: string;
  routingPolicy: RoutingPolicy;
  maxHourlyCostUsd?: number;
  latencyTargetMs?: number;
}

interface Weights {
  cost: number;
  latency: number;
  availability: number;
}

const policyWeights: Record<RoutingPolicy, Weights> = {
  cheapest: { cost: 0.7, latency: 0.1, availability: 0.2 },
  balanced: { cost: 0.45, latency: 0.35, availability: 0.2 },
  "low-latency": { cost: 0.2, latency: 0.6, availability: 0.2 }
};

export class NoCapacityMatchError extends Error {
  constructor() {
    super("NO_CAPACITY_MATCH");
    this.name = "NoCapacityMatchError";
  }
}

export function simulateRouting(
  request: RoutingRequest,
  providers: ProviderRecord[]
): RoutingSimulationResponse {
  const canonicalProfile = normalizeProfile(request.profile);

  const candidates = providers
    .filter((provider) => provider.status !== "down")
    .flatMap((provider) =>
      provider.capabilityDetails
        .filter((capability) => {
          const capCanonical = normalizeProfile(capability.profile);
          return capCanonical === canonicalProfile;
        })
        .filter((capability) =>
          request.region === "global" ? true : capability.region === request.region
        )
        .filter((capability) => capability.isAvailable)
        .filter((capability) =>
          request.maxHourlyCostUsd === undefined
            ? true
            : capability.priceValueUsd <= request.maxHourlyCostUsd
        )
        .filter((capability) =>
          request.latencyTargetMs === undefined
            ? true
            : (capability.latencyP50Ms ?? 1000) <= request.latencyTargetMs
        )
        .map((capability) => ({
          provider,
          estimatedHourlyCostUsd: capability.priceValueUsd,
          latencyP50Ms: capability.latencyP50Ms ?? 1000
        }))
    );

  if (candidates.length === 0) {
    throw new NoCapacityMatchError();
  }

  const maxCost = Math.max(...candidates.map((candidate) => candidate.estimatedHourlyCostUsd));
  const maxLatency = Math.max(...candidates.map((candidate) => candidate.latencyP50Ms));
  const weights = policyWeights[request.routingPolicy];

  const rankedCandidates: RoutingCandidate[] = candidates
    .map((candidate) => {
      const costScore = 1 - candidate.estimatedHourlyCostUsd / Math.max(maxCost, 0.000001);
      const latencyScore = 1 - candidate.latencyP50Ms / Math.max(maxLatency, 1);
      const availabilityScore = candidate.provider.status === "healthy" ? 1 : 0.55;

      const score =
        weights.cost * costScore +
        weights.latency * latencyScore +
        weights.availability * availabilityScore;

      return {
        provider_id: candidate.provider.id,
        provider_name: candidate.provider.name,
        score: Number(score.toFixed(4)),
        estimated_hourly_cost_usd: candidate.estimatedHourlyCostUsd,
        latency_p50_ms: candidate.latencyP50Ms,
        status: candidate.provider.status
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.estimated_hourly_cost_usd - b.estimated_hourly_cost_usd;
    });

  const winner = rankedCandidates[0];
  if (!winner) {
    throw new NoCapacityMatchError();
  }

  return {
    winner_provider_id: winner.provider_id,
    reason_code: `${request.routingPolicy}_score_best`,
    ranked_candidates: rankedCandidates
  };
}
