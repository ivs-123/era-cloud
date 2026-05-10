import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { EraStore } from "../storage/store.js";

const createTenantSchema = z.object({
  name: z.string().min(2).max(120)
});

export async function registerTenantRoutes(app: FastifyInstance, store: EraStore) {
  app.get("/api/v1/tenants", async () => ({
    data: await store.listTenants()
  }));

  app.post("/api/v1/tenants", async (request, reply) => {
    const body = createTenantSchema.parse(request.body);
    const tenant = await store.createTenant(body);

    return reply.code(201).send({ data: tenant });
  });
}
