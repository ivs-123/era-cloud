import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { calculateProjectedSpend, generateInvoice } from "../services/billing-engine.js";
import type { EraStore } from "../storage/store.js";
import { canAccessTenant, rejectTenantAccess } from "./tenant-access.js";

const usageEventSchema = z.object({
  tenant_id: z.string().min(2),
  workload_id: z.string().min(2),
  provider_id: z.string().min(2),
  metric: z.string().min(1),
  quantity: z.number().positive(),
  unit_cost_usd: z.number().nonnegative()
});

export async function registerBillingRoutes(app: FastifyInstance, store: EraStore) {
  app.post("/api/v1/usage/events", async (request, reply) => {
    const body = usageEventSchema.parse(request.body);

    if (!canAccessTenant(request, body.tenant_id)) {
      return rejectTenantAccess(reply);
    }

    const event = await store.recordUsageEvent({
      tenantId: body.tenant_id,
      workloadId: body.workload_id,
      providerId: body.provider_id,
      eventTime: new Date().toISOString(),
      metric: body.metric,
      quantity: body.quantity,
      unitCostUsd: body.unit_cost_usd
    });

    return reply.code(201).send({ data: event });
  });

  app.get("/api/v1/usage", async (request, reply) => {
    const query = z
      .object({
        tenant_id: z.string().min(2),
        from: z.string().optional(),
        to: z.string().optional()
      })
      .parse(request.query);

    if (!canAccessTenant(request, query.tenant_id)) {
      return rejectTenantAccess(reply);
    }

    const events = await store.listUsageEvents({
      tenantId: query.tenant_id,
      from: query.from,
      to: query.to
    });

    return { data: events };
  });

  app.get("/api/v1/billing/estimate", async (request, reply) => {
    const query = z.object({ tenant_id: z.string().min(2) }).parse(request.query);
    if (!canAccessTenant(request, query.tenant_id)) {
      return rejectTenantAccess(reply);
    }

    const projection = await calculateProjectedSpend(store, query.tenant_id);

    return { data: projection };
  });

  app.get("/api/v1/billing/invoices", async (request, reply) => {
    const query = z.object({ tenant_id: z.string().min(2).optional() }).parse(request.query);
    if (query.tenant_id && !canAccessTenant(request, query.tenant_id)) {
      return rejectTenantAccess(reply);
    }

    const invoices = await store.listInvoices({
      tenantId: query.tenant_id ?? request.auth?.tenantId
    });

    return { data: invoices };
  });

  app.post("/api/v1/billing/invoices/generate", async (request, reply) => {
    const body = z.object({ tenant_id: z.string().min(2) }).parse(request.body);

    if (!canAccessTenant(request, body.tenant_id)) {
      return rejectTenantAccess(reply);
    }

    const invoice = await generateInvoice(store, body.tenant_id);

    return reply.code(201).send({ data: invoice });
  });
}
