import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { EraStore } from "../storage/store.js";
import { canAccessTenant, getAuthTenantId, rejectTenantAccess } from "./tenant-access.js";

const addKeySchema = z.object({
  tenant_id: z.string().min(2),
  provider_name: z.string().min(1),
  key_label: z.string().min(1).max(200),
  key_value: z.string().min(8)
});

export async function registerByokRoutes(app: FastifyInstance, store: EraStore) {
  app.post("/api/v1/keys", async (request, reply) => {
    const body = addKeySchema.parse(request.body);

    if (!canAccessTenant(request, body.tenant_id)) {
      return rejectTenantAccess(reply);
    }

    if (!(await store.getTenant(body.tenant_id))) {
      return reply.code(404).send({ error: "TENANT_NOT_FOUND" });
    }

    const prefix = body.key_value.slice(0, 4) + "..." + body.key_value.slice(-4);

    const key = await store.addTenantKey({
      tenantId: body.tenant_id,
      providerName: body.provider_name,
      keyLabel: body.key_label,
      keyPrefix: prefix
    });

    return reply.code(201).send({
      data: {
        id: key.id,
        tenant_id: key.tenantId,
        provider_name: key.providerName,
        key_label: key.keyLabel,
        key_prefix: key.keyPrefix,
        created_at: key.createdAt
      }
    });
  });

  app.get("/api/v1/keys", async (request, reply) => {
    const query = z.object({ tenant_id: z.string().min(2) }).parse(request.query);

    if (!canAccessTenant(request, query.tenant_id)) {
      return rejectTenantAccess(reply);
    }

    const keys = await store.listTenantKeys(query.tenant_id);

    return {
      data: keys.map((key) => ({
        id: key.id,
        tenant_id: key.tenantId,
        provider_name: key.providerName,
        key_label: key.keyLabel,
        key_prefix: key.keyPrefix,
        created_at: key.createdAt
      }))
    };
  });

  app.delete("/api/v1/keys/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(2) }).parse(request.params);
    await store.removeTenantKey(params.id, getAuthTenantId(request));

    return { data: { id: params.id, removed: true } };
  });
}
