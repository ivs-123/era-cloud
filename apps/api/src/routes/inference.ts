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
  stream: z.boolean().optional()
});

export async function registerInferenceRoutes(app: FastifyInstance, store: EraStore) {
  app.post("/v1/chat/completions", async (request, reply) => {
    const body = chatCompletionSchema.parse(request.body);
    const tenantId = request.auth?.tenantId;

    if (!tenantId) {
      return reply.code(401).send({ error: "UNAUTHORIZED" });
    }

    const model = body.model;

    try {
      const allProviders = await store.listProviders();
      const providersByType = allProviders.filter((p) => p.type === "inference" || p.type === "server");

      const simulation = simulateRouting(
        {
          kind: "inference",
          profile: model,
          region: "global",
          routingPolicy: "cheapest"
        },
        await store.listProviders()
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
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: `[ERA Cloud routed to ${winner.provider_name} at $${winner.estimated_hourly_cost_usd}/1k tokens]`
            },
            finish_reason: "stop"
          }
        ],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        },
        era_routing: {
          provider: winner.provider_name,
          cost_per_1k_tokens: winner.estimated_hourly_cost_usd,
          policy: "cheapest"
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
    const models = new Set<string>();

    for (const provider of providers) {
      for (const cap of provider.capabilityDetails) {
        if (cap.isAvailable) {
          models.add(cap.profile);
        }
      }
    }

    return {
      object: "list",
      data: [...models].map((id) => ({
        id,
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "era-cloud"
      }))
    };
  });
}
