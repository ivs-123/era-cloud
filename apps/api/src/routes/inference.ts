import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { simulateRouting, NoCapacityMatchError } from "../services/routing-engine.js";
import type { EraStore } from "../storage/store.js";

const chatCompletionSchema = z.object({
  model: z.string().min(1),
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string()
    })
  ).min(1),
  temperature: z.number().optional(),
  max_tokens: z.number().int().positive().optional(),
  stream: z.boolean().optional(),
  provider: z.string().optional(),
  preferred_providers: z.array(z.string()).optional(),
  blocked_providers: z.array(z.string()).optional()
});

const tenantPrefs = new Map<string, { preferred: string[]; blocked: string[] }>();

export async function registerInferenceRoutes(app: FastifyInstance, store: EraStore) {
  app.post("/v1/chat/completions", async (request, reply) => {
    const body = chatCompletionSchema.parse(request.body);
    const tenantId = request.auth?.tenantId;

    if (!tenantId) {
      return reply.code(401).send({ error: "UNAUTHORIZED" });
    }

    const prefs = tenantPrefs.get(tenantId);
    const preferred = body.preferred_providers ?? prefs?.preferred ?? [];
    const blocked = body.blocked_providers ?? prefs?.blocked ?? [];

    const allProviders = await store.listProviders();
    let providers = allProviders;

    if (body.provider) {
      const target = allProviders.find((p) => p.name === body.provider);
      if (!target) {
        return reply.code(404).send({
          error: "PROVIDER_NOT_FOUND",
          message: `Provider "${body.provider}" is not connected. Available: ${allProviders.map(p => p.name).join(", ")}`
        });
      }

      const cap = target.capabilityDetails.find((c) => c.isAvailable);
      const cost = cap?.priceValueUsd ?? 0;

      return {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: body.model,
        choices: [{
          index: 0,
          message: { role: "assistant", content: `[ERA Cloud routed to ${target.name} (manual override)]` },
          finish_reason: "stop"
        }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        era_routing: {
          provider: target.name,
          cost_per_1k_tokens: cost,
          policy: "manual",
          mode: "manual"
        }
      };
    }

    if (blocked.length > 0) {
      providers = providers.filter((p) => !blocked.includes(p.name));
    }

    try {
      const simulation = simulateRouting(
        {
          kind: "inference",
          profile: body.model,
          region: "global",
          routingPolicy: "cheapest"
        },
        providers,
        preferred
      );

      const winner = simulation.ranked_candidates[0];

      if (!winner) {
        return reply.code(404).send({
          error: "NO_PROVIDER",
          message: `No provider available for model "${body.model}"`
        });
      }

      return {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: body.model,
        choices: [{
          index: 0,
          message: { role: "assistant", content: `[ERA Cloud routed to ${winner.provider_name} at $${winner.estimated_hourly_cost_usd}/1k tokens]` },
          finish_reason: "stop"
        }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        era_routing: {
          provider: winner.provider_name,
          cost_per_1k_tokens: winner.estimated_hourly_cost_usd,
          policy: preferred.length > 0 ? "preferred" : "cheapest",
          mode: "auto",
          ranked_providers: simulation.ranked_candidates.slice(0, 5).map((c) => ({
            provider: c.provider_name,
            cost: c.estimated_hourly_cost_usd,
            score: c.score
          }))
        }
      };
    } catch (error) {
      if (error instanceof NoCapacityMatchError) {
        return reply.code(404).send({
          error: "NO_PROVIDER",
          message: `No provider available for model "${body.model}"`
        });
      }
      throw error;
    }
  });

  app.get("/v1/models", async (request, reply) => {
    if (!request.auth?.tenantId) {
      return reply.code(401).send({ error: "UNAUTHORIZED" });
    }

    const providers = await store.listProviders();
    const models = new Map<string, { providers: string[] }>();

    for (const provider of providers) {
      for (const cap of provider.capabilityDetails) {
        if (!cap.isAvailable) continue;
        const existing = models.get(cap.profile);
        if (existing) {
          existing.providers.push(provider.name);
        } else {
          models.set(cap.profile, { providers: [provider.name] });
        }
      }
    }

    return {
      object: "list",
      data: [...models.entries()].map(([id, info]) => ({
        id,
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "era-cloud",
        available_providers: info.providers
      }))
    };
  });

  app.put("/api/v1/tenants/preferences", async (request, reply) => {
    const body = z.object({
      preferred_providers: z.array(z.string()).optional(),
      blocked_providers: z.array(z.string()).optional()
    }).parse(request.body);

    const tenantId = request.auth?.tenantId;
    if (!tenantId) return reply.code(401).send({ error: "UNAUTHORIZED" });

    const existing = tenantPrefs.get(tenantId) ?? { preferred: [], blocked: [] };
    const updated = {
      preferred: body.preferred_providers ?? existing.preferred,
      blocked: body.blocked_providers ?? existing.blocked
    };
    tenantPrefs.set(tenantId, updated);

    return { data: updated };
  });

  app.get("/api/v1/tenants/preferences", async (request, reply) => {
    const tenantId = request.auth?.tenantId;
    if (!tenantId) return reply.code(401).send({ error: "UNAUTHORIZED" });

    return { data: tenantPrefs.get(tenantId) ?? { preferred: [], blocked: [] } };
  });
}
