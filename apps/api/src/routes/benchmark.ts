import type { FastifyInstance } from "fastify";
import { getBenchmark } from "../services/benchmark.js";
import type { EraStore } from "../storage/store.js";

export async function registerBenchmarkRoutes(app: FastifyInstance, store: EraStore) {
  app.get("/api/v1/benchmark/gpu", async () => {
    const benchmark = await getBenchmark(store);
    return {
      data: benchmark.map((b) => ({
        canonical_gpu: b.canonical_gpu,
        provider_count: b.provider_count,
        min_price: b.min_price,
        max_price: b.max_price,
        avg_price: Math.round(b.avg_price * 10000) / 10000,
        cheapest_provider: b.cheapest_provider,
        cheapest_region: b.cheapest_region,
        entries: b.entries.map((e) => ({
          provider: e.provider,
          region: e.region,
          price_per_hour: e.price_per_hour,
          price_unit: e.price_unit
        }))
      })),
      total_providers: new Set(benchmark.flatMap((b) => b.entries.map((e) => e.provider))).size
    };
  });
}
