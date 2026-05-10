import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { NoCapacityMatchError, simulateRouting } from "../services/routing-engine.js";
import type { EraStore } from "../storage/store.js";

const createWorkloadSchema = z.object({
  tenant_id: z.string().min(2),
  kind: z.enum(["inference", "server"]),
  profile: z.string().min(2),
  region: z.string().min(2),
  routing_policy: z.enum(["cheapest", "balanced", "low-latency"]),
  max_hourly_cost_usd: z.number().positive().optional(),
  latency_target_ms: z.number().int().positive().optional(),
  metadata: z.record(z.string(), z.string()).default({})
});

export async function registerWorkloadRoutes(app: FastifyInstance, store: EraStore) {
  app.get("/api/v1/workloads", async () => ({
    data: await store.listWorkloads()
  }));

  app.get("/api/v1/workloads/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(2) }).parse(request.params);
    const workload = await store.getWorkload(params.id);

    if (!workload) {
      return reply.code(404).send({ error: "WORKLOAD_NOT_FOUND" });
    }

    return { data: workload };
  });

  app.post("/api/v1/workloads/:id/stop", async (request, reply) => {
    const params = z.object({ id: z.string().min(2) }).parse(request.params);
    const workload = await store.getWorkload(params.id);

    if (!workload) {
      return reply.code(404).send({ error: "WORKLOAD_NOT_FOUND" });
    }

    if (workload.state === "stopped") {
      return { data: workload };
    }

    const stopped = await store.updateWorkloadState(params.id, "stopped");
    return { data: stopped };
  });

  app.post("/api/v1/workloads", async (request, reply) => {
    const body = createWorkloadSchema.parse(request.body);

    if (!(await store.getTenant(body.tenant_id))) {
      return reply.code(404).send({ error: "TENANT_NOT_FOUND" });
    }

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

      const workload = await store.createWorkload({
        tenantId: body.tenant_id,
        kind: body.kind,
        profile: body.profile,
        region: body.region,
        routingPolicy: body.routing_policy,
        state: "provisioning",
        selectedProviderId: simulation.winner_provider_id,
        constraints: {
          maxHourlyCostUsd: body.max_hourly_cost_usd,
          latencyTargetMs: body.latency_target_ms
        },
        metadata: body.metadata
      });

      await store.createRoutingDecision({
        tenantId: body.tenant_id,
        workloadId: workload.id,
        winnerProviderId: simulation.winner_provider_id,
        candidateScores: simulation.ranked_candidates,
        reasonCode: simulation.reason_code
      });

      return reply.code(201).send({
        data: {
          id: workload.id,
          state: workload.state,
          selected_provider_id: workload.selectedProviderId,
          routing_reason: simulation.reason_code,
          created_at: workload.createdAt
        }
      });
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
