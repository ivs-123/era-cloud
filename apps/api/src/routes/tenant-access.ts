import type { FastifyReply, FastifyRequest } from "fastify";

export function getAuthTenantId(request: FastifyRequest): string | undefined {
  return request.auth?.tenantId;
}

export function canAccessTenant(request: FastifyRequest, tenantId: string): boolean {
  if (process.env.SKIP_AUTH === "true") {
    return true;
  }

  return request.auth?.tenantId === tenantId;
}

export function rejectTenantAccess(reply: FastifyReply) {
  return reply.code(403).send({
    error: "TENANT_FORBIDDEN",
    message: "Authenticated tenant does not match the requested tenant."
  });
}

