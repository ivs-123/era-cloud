import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { verifyToken, type AuthPayload } from "../services/auth.js";

declare module "fastify" {
  interface FastifyRequest {
    auth?: AuthPayload;
  }
}

const PUBLIC_ROUTES = new Set([
  "/health",
  "/api/v1/auth/register",
  "/api/v1/auth/login",
  "/api/v1/benchmark/gpu",
  "/api/v1/providers",
  "/api/v1/workloads",
  "/api/v1/tenants"
]);

export async function registerAuthMiddleware(app: FastifyInstance) {
  const skipAuth = process.env.SKIP_AUTH === "true";

  app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.method === "OPTIONS" || skipAuth) return;

    const rawUrl = request.url ?? "/";
    const path = rawUrl.split("?")[0] ?? "/";

    const isSyncRoute = path.startsWith("/api/v1/providers/") && path.endsWith("/sync");

    if (PUBLIC_ROUTES.has(path) || path.startsWith("/api/v1/benchmark") || isSyncRoute) {
      return;
    }

    const header = request.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return reply.code(401).send({ error: "UNAUTHORIZED", message: "Bearer token required" });
    }

    const token = header.slice(7);

    try {
      request.auth = verifyToken(token);
    } catch {
      return reply.code(401).send({ error: "UNAUTHORIZED", message: "Invalid or expired token" });
    }
  });
}
