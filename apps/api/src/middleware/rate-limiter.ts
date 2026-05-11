import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 600;

declare module "fastify" {
  interface FastifyRequest {
    rateLimit?: { remaining: number; limit: number; resetAt: number };
  }
}

export async function registerRateLimiter(app: FastifyInstance) {
  const buckets = new Map<string, RateLimitEntry>();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of buckets) {
      if (now > entry.resetAt) {
        buckets.delete(key);
      }
    }
  }, 60_000);

  app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    const tenantId = request.auth?.tenantId ?? "anonymous";
    const now = Date.now();
    const entry = buckets.get(tenantId);

    if (!entry || now > entry.resetAt) {
      buckets.set(tenantId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      request.rateLimit = { remaining: RATE_LIMIT_MAX_REQUESTS - 1, limit: RATE_LIMIT_MAX_REQUESTS, resetAt: now + RATE_LIMIT_WINDOW_MS };
      return;
    }

    entry.count++;

    if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return reply
        .code(429)
        .header("Retry-After", String(retryAfter))
        .send({ error: "RATE_LIMITED", message: `Try again in ${retryAfter}s`, retry_after: retryAfter });
    }

    request.rateLimit = {
      remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
      limit: RATE_LIMIT_MAX_REQUESTS,
      resetAt: entry.resetAt
    };
  });
}
