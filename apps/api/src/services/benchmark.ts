import type { EraStore } from "../storage/store.js";
import { normalizeProfile } from "./gpu-normalizer.js";

export interface BenchmarkEntry {
  canonical_gpu: string;
  provider: string;
  region: string;
  price_per_hour: number;
  price_unit: string;
  profile_raw: string;
}

export interface BenchmarkSummary {
  canonical_gpu: string;
  provider_count: number;
  min_price: number;
  max_price: number;
  avg_price: number;
  cheapest_provider: string;
  cheapest_region: string;
  entries: BenchmarkEntry[];
}

export async function getBenchmark(store: EraStore): Promise<BenchmarkSummary[]> {
  const providers = await store.listProviders();
  const entries: BenchmarkEntry[] = [];

  for (const provider of providers) {
    for (const cap of provider.capabilityDetails) {
      if (!cap.isAvailable) continue;

      const canonical = normalizeProfile(cap.profile);

      if (canonical === "compute-cpu" || canonical === "compute-memory") continue;

      entries.push({
        canonical_gpu: canonical,
        provider: provider.name,
        region: cap.region,
        price_per_hour: cap.priceValueUsd,
        price_unit: cap.priceUnit,
        profile_raw: cap.profile
      });
    }
  }

  const grouped = new Map<string, BenchmarkEntry[]>();

  for (const entry of entries) {
    const key = entry.canonical_gpu;
    const group = grouped.get(key) ?? [];
    group.push(entry);
    grouped.set(key, group);
  }

  const summary: BenchmarkSummary[] = [];

  for (const [gpu, group] of grouped) {
    const prices = group.map((e) => e.price_per_hour);
    const cheapest = group.reduce((a, b) => (a.price_per_hour < b.price_per_hour ? a : b));

    summary.push({
      canonical_gpu: gpu,
      provider_count: [...new Set(group.map((e) => e.provider))].length,
      min_price: Math.min(...prices),
      max_price: Math.max(...prices),
      avg_price: prices.reduce((s, p) => s + p, 0) / prices.length,
      cheapest_provider: cheapest.provider,
      cheapest_region: cheapest.region,
      entries: group
        .sort((a, b) => a.price_per_hour - b.price_per_hour)
        .slice(0, 20)
    });
  }

  return summary.sort((a, b) => a.min_price - b.min_price);
}
