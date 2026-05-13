import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { EraStore } from "../storage/store.js";
import { getAuthTenantId } from "./tenant-access.js";

const createTenantSchema = z.object({
  name: z.string().min(2).max(120)
});

export async function registerTenantRoutes(app: FastifyInstance, store: EraStore) {
  app.get("/api/v1/tenants", async (request) => {
    const authTenantId = getAuthTenantId(request);
    const tenants = await store.listTenants();

    if (authTenantId) {
      return { data: tenants.filter((tenant) => tenant.id === authTenantId) };
    }

    return { data: tenants };
  });

  app.post("/api/v1/tenants", async (request, reply) => {
    const body = createTenantSchema.parse(request.body);
    const tenant = await store.createTenant(body);

    return reply.code(201).send({ data: tenant });
  });
}
