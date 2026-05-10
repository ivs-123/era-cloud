import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { EraStore } from "../storage/store.js";

const createProviderSchema = z.object({
  name: z.string().min(2).max(120),
  type: z.enum(["inference", "server"]),
  status: z.enum(["healthy", "degraded", "down"]).default("healthy"),
  regions: z.array(z.string().min(2)).min(1),
  capabilities: z.array(z.string().min(2)).min(1),
  capability_details: z
    .array(
      z.object({
        region: z.string().min(2),
        profile: z.string().min(2),
        priceUnit: z.enum(["hour", "token", "gb", "1k_tokens"]).default("hour"),
        priceValueUsd: z.number().nonnegative(),
        latencyP50Ms: z.number().int().positive().optional(),
        isAvailable: z.boolean().default(true)
      })
    )
    .optional()
});

export async function registerProviderRoutes(app: FastifyInstance, store: EraStore) {
  app.get("/api/v1/providers", async () => ({
    data: await store.listProviders()
  }));

  app.post("/api/v1/admin/providers", async (request, reply) => {
    const body = createProviderSchema.parse(request.body);
    const provider = await store.createProvider({
      name: body.name,
      type: body.type,
      status: body.status,
      regions: body.regions,
      capabilities: body.capabilities,
      capabilityDetails: body.capability_details
    });

    return reply.code(201).send({ data: provider });
  });
}
