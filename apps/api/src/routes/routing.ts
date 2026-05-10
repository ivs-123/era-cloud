import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { NoCapacityMatchError, simulateRouting } from "../services/routing-engine.js";
import type { EraStore } from "../storage/store.js";

export const routingRequestSchema = z.object({
  kind: z.enum(["inference", "server"]),
  profile: z.string().min(2),
  region: z.string().min(2),
  routing_policy: z.enum(["cheapest", "balanced", "low-latency"]),
  max_hourly_cost_usd: z.number().positive().optional(),
  latency_target_ms: z.number().int().positive().optional()
});

export async function registerRoutingRoutes(app: FastifyInstance, store: EraStore) {
  app.post("/api/v1/routing/simulate", async (request, reply) => {
    const body = routingRequestSchema.parse(request.body);

    try {
      const simulation = simulateRouting(
        {
          kind: body.kind,
          profile: body.profile,
          region: body.region,
          routingPolicy: body.routing_policy,
          maxHourlyCostUsd: body.max_hourly_cost_usd,
          latencyTargetMs: body.latency_target_ms
        },
        await store.listProviders()
      );

      return { data: simulation };
    } catch (error) {
      if (error instanceof NoCapacityMatchError) {
        return reply.code(409).send({
          error: "NO_CAPACITY_MATCH",
          message: "No provider matches the requested workload constraints."
        });
      }

      throw error;
    }
  });
}
