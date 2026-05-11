import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createToken, generateApiKey, hashApiKey } from "../services/auth.js";
import type { EraStore } from "../storage/store.js";

const registerSchema = z.object({
  tenant_name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const users = new Map<string, { id: string; email: string; password: string; tenantId: string; role: string }>();
const apiKeys = new Map<string, { tenantId: string; userId: string; prefix: string }>();

export async function registerAuthRoutes(app: FastifyInstance, store: EraStore) {
  app.post("/api/v1/auth/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);

    const existing = [...users.values()].find((user) => user.email === body.email);

    if (existing) {
      return reply.code(409).send({ error: "EMAIL_EXISTS" });
    }

    const tenant = await store.createTenant({ name: body.tenant_name });
    const userId = `usr_${Date.now().toString(36)}`;
    const role = "owner";

    users.set(userId, {
      id: userId,
      email: body.email,
      password: body.password,
      tenantId: tenant.id,
      role
    });

    const token = createToken({
      tenantId: tenant.id,
      userId,
      role
    });

    return reply.code(201).send({
      data: {
        token,
        tenant_id: tenant.id,
        tenant_name: tenant.name,
        user_id: userId,
        role
      }
    });
  });

  app.post("/api/v1/auth/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const user = [...users.values()].find((user) => user.email === body.email);

    if (!user || user.password !== body.password) {
      return reply.code(401).send({ error: "INVALID_CREDENTIALS" });
    }

    const token = createToken({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role
    });

    return {
      data: {
        token,
        tenant_id: user.tenantId,
        user_id: user.id,
        role: user.role
      }
    };
  });

  app.get("/api/v1/auth/me", async (request) => {
    return {
      data: {
        tenant_id: request.auth?.tenantId,
        user_id: request.auth?.userId,
        role: request.auth?.role
      }
    };
  });

  app.post("/api/v1/auth/api-keys", async (request, reply) => {
    if (!request.auth) {
      return reply.code(401).send({ error: "UNAUTHORIZED" });
    }

    const { key, prefix } = generateApiKey();
    const hash = hashApiKey(key);

    apiKeys.set(hash, {
      tenantId: request.auth.tenantId,
      userId: request.auth.userId,
      prefix
    });

    return reply.code(201).send({
      data: {
        api_key: key,
        prefix,
        note: "Store this key securely. It will not be shown again."
      }
    });
  });

  app.get("/api/v1/auth/api-keys", async (request, reply) => {
    if (!request.auth) {
      return reply.code(401).send({ error: "UNAUTHORIZED" });
    }

    const keys = [...apiKeys.entries()]
      .filter(([, v]) => v.tenantId === request.auth!.tenantId)
      .map(([hash, v]) => ({
        id: hash,
        prefix: v.prefix,
        created_at: new Date().toISOString()
      }));

    return { data: keys };
  });
}
