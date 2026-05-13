import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { ProviderRegistry } from "../providers/registry.js";
import type { EraStore } from "../storage/store.js";
import { canAccessTenant, rejectTenantAccess } from "./tenant-access.js";

export async function registerProviderBridgeRoutes(
  app: FastifyInstance,
  store: EraStore,
  registry: ProviderRegistry
) {
  app.post("/api/v1/providers/:name/sync", async (request, reply) => {
    const params = z.object({ name: z.string().min(2) }).parse(request.params);
    const adapter = registry.get(params.name);

    if (!adapter) {
      return reply.code(404).send({ error: "PROVIDER_NOT_FOUND" });
    }

    const capabilities = await adapter.syncCapabilities();
    const status = await adapter.healthCheck();

    const existingProviders = await store.listProviders();
    const existing = existingProviders.find((provider) => provider.name === adapter.name);

    let provider;
    if (existing) {
      provider = await store.updateProviderCapabilities(existing.id, capabilities, status);
    } else {
      provider = await store.createProvider({
        name: adapter.name,
        type: adapter.type,
        status,
        regions: adapter.regions,
        capabilities: [...new Set(capabilities.map((capability) => capability.profile))],
        capabilityDetails: capabilities
      });
    }

    return {
      data: {
        provider,
        capabilities_count: capabilities.length,
        status
      }
    };
  });

  app.get("/api/v1/providers/:name/instances", async (request, reply) => {
    const params = z.object({ name: z.string().min(2) }).parse(request.params);
    const adapter = registry.get(params.name);

    if (!adapter) {
      return reply.code(404).send({ error: "PROVIDER_NOT_FOUND" });
    }

    try {
      const instances = await adapter.listInstances();
      return { data: instances };
    } catch (error) {
      return reply.code(502).send({
        error: "PROVIDER_ERROR",
        message: error instanceof Error ? error.message : "Provider request failed"
      });
    }
  });

  const createInstanceSchema = z.object({
    tenant_id: z.string().min(2),
    gpu_type: z.string().min(1),
    num_gpus: z.number().int().positive().default(1),
    cpu_cores: z.number().int().positive().default(4),
    disk_size_gb: z.number().int().positive().default(100),
    template: z.string().min(1),
    region: z.string().min(1),
    mode: z.string().default("prototyping"),
    public_key: z.string().optional()
  });

  app.post("/api/v1/providers/:name/instances", async (request, reply) => {
    const params = z.object({ name: z.string().min(2) }).parse(request.params);
    const body = createInstanceSchema.parse(request.body);
    const adapter = registry.get(params.name);

    if (!canAccessTenant(request, body.tenant_id)) {
      return rejectTenantAccess(reply);
    }

    if (!adapter) {
      return reply.code(404).send({ error: "PROVIDER_NOT_FOUND" });
    }

    if (!(await store.getTenant(body.tenant_id))) {
      return reply.code(404).send({ error: "TENANT_NOT_FOUND" });
    }

    try {
      const instance = await adapter.createInstance({
        gpuType: body.gpu_type,
        numGpus: body.num_gpus,
        cpuCores: body.cpu_cores,
        diskSizeGb: body.disk_size_gb,
        template: body.template,
        region: body.region,
        mode: body.mode,
        publicKey: body.public_key
      });

      await store.createWorkload({
        tenantId: body.tenant_id,
        kind: "server",
        profile: body.template,
        region: body.region,
        routingPolicy: "balanced",
        state: "running",
        selectedProviderId: adapter.name,
        constraints: {},
        metadata: {
          provider_instance_id: instance.id,
          gpu_type: body.gpu_type,
          template: body.template
        }
      });

      return reply.code(201).send({ data: instance });
    } catch (error) {
      return reply.code(502).send({
        error: "PROVIDER_ERROR",
        message: error instanceof Error ? error.message : "Provider request failed"
      });
    }
  });

  app.post("/api/v1/providers/:name/instances/:instanceId/stop", async (request, reply) => {
    const params = z
      .object({ name: z.string().min(2), instanceId: z.string().min(2) })
      .parse(request.params);
    const adapter = registry.get(params.name);

    if (!adapter) {
      return reply.code(404).send({ error: "PROVIDER_NOT_FOUND" });
    }

    try {
      await adapter.stopInstance(params.instanceId);
      return { data: { id: params.instanceId, status: "stopped" } };
    } catch (error) {
      return reply.code(502).send({
        error: "PROVIDER_ERROR",
        message: error instanceof Error ? error.message : "Provider request failed"
      });
    }
  });
}
