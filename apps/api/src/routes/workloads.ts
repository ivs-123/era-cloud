import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { NoCapacityMatchError, simulateRouting } from "../services/routing-engine.js";
import type { EraStore } from "../storage/store.js";
import { canAccessTenant, getAuthTenantId, rejectTenantAccess } from "./tenant-access.js";

const createWorkloadSchema = z.object({
  tenant_id: z.string().min(2),
  kind: z.enum(["inference", "server"]),
  profile: z.string().min(2),
  region: z.string().min(2),
  routing_policy: z.enum(["cheapest", "balanced", "low-latency"]),
  max_hourly_cost_usd: z.number().positive().optional(),
  latency_target_ms: z.number().int().positive().optional(),
  metadata: z.record(z.string(), z.string()).default({}),
  tenant_key_id: z.string().optional()
});

export async function registerWorkloadRoutes(app: FastifyInstance, store: EraStore) {
  app.get("/api/v1/workloads", async (request) => {
    const workloads = await store.listWorkloads();
    const authTenantId = getAuthTenantId(request);

    if (authTenantId) {
      return { data: workloads.filter((workload) => workload.tenantId === authTenantId) };
    }

    return { data: workloads };
  });

  app.get("/api/v1/workloads/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(2) }).parse(request.params);
    const workload = await store.getWorkload(params.id);

    if (!workload) {
      return reply.code(404).send({ error: "WORKLOAD_NOT_FOUND" });
    }

    if (!canAccessTenant(request, workload.tenantId)) {
      return rejectTenantAccess(reply);
    }

    return { data: workload };
  });

  app.post("/api/v1/workloads/:id/stop", async (request, reply) => {
    const params = z.object({ id: z.string().min(2) }).parse(request.params);
    const workload = await store.getWorkload(params.id);

    if (!workload) {
      return reply.code(404).send({ error: "WORKLOAD_NOT_FOUND" });
    }

    if (!canAccessTenant(request, workload.tenantId)) {
      return rejectTenantAccess(reply);
    }

    if (workload.state === "stopped") {
      return { data: workload };
    }

    const stopped = await store.updateWorkloadState(params.id, "stopped");
    return { data: stopped };
  });

  app.post("/api/v1/workloads", async (request, reply) => {
    const body = createWorkloadSchema.parse(request.body);

    if (!canAccessTenant(request, body.tenant_id)) {
      return rejectTenantAccess(reply);
    }

    if (!(await store.getTenant(body.tenant_id))) {
      return reply.code(404).send({ error: "TENANT_NOT_FOUND" });
    }

    if (body.tenant_key_id) {
      const keys = await store.listTenantKeys(body.tenant_id);
      const tenantKey = keys.find((key) => key.id === body.tenant_key_id);

      if (!tenantKey) {
        return reply.code(404).send({ error: "TENANT_KEY_NOT_FOUND" });
      }

      const byokProviderId = `byok_${tenantKey.id}`;

      const workload = await store.createWorkload({
        tenantId: body.tenant_id,
        kind: body.kind,
        profile: body.profile,
        region: body.region,
        routingPolicy: body.routing_policy,
        state: "provisioning",
        selectedProviderId: byokProviderId,
        constraints: {
          maxHourlyCostUsd: body.max_hourly_cost_usd,
          latencyTargetMs: body.latency_target_ms
        },
        metadata: {
          ...body.metadata,
          byok_provider: tenantKey.providerName,
          byok_key_id: tenantKey.id,
          byok_mode: "true"
        }
      });

      await store.createRoutingDecision({
        tenantId: body.tenant_id,
        workloadId: workload.id,
        winnerProviderId: byokProviderId,
        candidateScores: [],
        reasonCode: "byok_direct_route"
      });

      return reply.code(201).send({
        data: {
          id: workload.id,
          state: workload.state,
          selected_provider_id: workload.selectedProviderId,
          routing_reason: "byok_direct_route",
          byok_provider: tenantKey.providerName,
          created_at: workload.createdAt
        }
      });
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
