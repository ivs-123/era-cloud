import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createToken, generateApiKey, hashApiKey, hashPassword, verifyPassword } from "../services/auth.js";
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

export async function registerAuthRoutes(app: FastifyInstance, store: EraStore) {
  app.post("/api/v1/auth/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);

    const existing = await store.getUserByEmail(body.email);

    if (existing) {
      return reply.code(409).send({ error: "EMAIL_EXISTS" });
    }

    const tenant = await store.createTenant({ name: body.tenant_name });
    const passwordHash = hashPassword(body.password);
    const role = "owner";

    const user = await store.createUser({
      email: body.email,
      passwordHash,
      tenantId: tenant.id,
      role
    });

    const token = createToken({
      tenantId: tenant.id,
      userId: user.id,
      role
    });

    const { key: apiKey, prefix: apiKeyPrefix } = generateApiKey();
    const hash = hashApiKey(apiKey);
    await store.addApiKey({
      tenantId: tenant.id,
      userId: user.id,
      prefix: apiKeyPrefix,
      hash
    });

    return reply.code(201).send({
      data: {
        token,
        api_key: apiKey,
        api_key_prefix: apiKeyPrefix,
        tenant_id: tenant.id,
        tenant_name: tenant.name,
        user_id: user.id,
        role
      }
    });
  });

  app.post("/api/v1/auth/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const user = await store.getUserByEmail(body.email);

    if (!user || !verifyPassword(body.password, user.passwordHash)) {
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

    await store.addApiKey({
      tenantId: request.auth.tenantId,
      userId: request.auth.userId,
      prefix,
      hash
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

    const keys = await store.listApiKeys(request.auth.tenantId);
    return {
      data: keys.map((k) => ({
        id: k.id,
        prefix: k.prefix,
        created_at: k.createdAt
      }))
    };
  });
}
