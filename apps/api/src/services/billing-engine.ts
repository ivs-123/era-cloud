import { nanoid } from "nanoid";
import type { EraStore, InvoiceLineRecord, InvoiceRecord, UsageEventRecord } from "../storage/store.js";

const DEFAULT_MARKUP_PERCENT = 20;

export interface BillingPeriod {
  id: string;
  tenantId: string;
  periodStart: string;
  periodEnd: string;
}

export async function generateInvoice(
  store: EraStore,
  tenantId: string,
  markupPercent: number = DEFAULT_MARKUP_PERCENT
): Promise<InvoiceRecord> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const periodEnd = now.toISOString();

  const usageEvents = await store.listUsageEvents({
    tenantId,
    from: periodStart,
    to: periodEnd
  });

  const billingPeriodId = `bp_${nanoid(10)}`;

  const providerTotals = new Map<string, { quantity: number; cost: number; description: string }>();

  for (const event of usageEvents) {
    const key = `${event.providerId}:${event.metric}`;
    const existing = providerTotals.get(key);

    if (existing) {
      existing.quantity += event.quantity;
      existing.cost += event.quantity * event.unitCostUsd;
    } else {
      providerTotals.set(key, {
        quantity: event.quantity,
        cost: event.quantity * event.unitCostUsd,
        description: `${event.metric} on ${event.providerId}`
      });
    }
  }

  const lines: InvoiceLineRecord[] = [];
  let subtotal = 0;

  for (const [, total] of providerTotals) {
    const line: InvoiceLineRecord = {
      id: `invl_${nanoid(10)}`,
      invoiceId: "",
      description: total.description,
      quantity: total.quantity,
      unitPriceUsd: total.quantity > 0 ? total.cost / total.quantity : 0,
      amountUsd: total.cost
    };

    lines.push(line);
    subtotal += total.cost;
  }

  const markup = subtotal * (markupPercent / 100);
  const total = subtotal + markup;

  const invoice = await store.createInvoice({
    tenantId,
    billingPeriodId,
    subtotalUsd: Math.round(subtotal * 100) / 100,
    markupUsd: Math.round(markup * 100) / 100,
    totalUsd: Math.round(total * 100) / 100,
    currency: "USD",
    status: "draft",
    lines
  });

  return invoice;
}

export async function calculateProjectedSpend(
  store: EraStore,
  tenantId: string
): Promise<{ dailyRateUsd: number; projectedMonthlyUsd: number; runningWorkloadCount: number }> {
  const workloads = await store.listWorkloads();
  const tenantWorkloads = workloads.filter(
    (wl) => wl.tenantId === tenantId && (wl.state === "running" || wl.state === "provisioning")
  );

  const providers = await store.listProviders();
  let hourlyRate = 0;

  for (const wl of tenantWorkloads) {
    const provider = providers.find((provider) => provider.id === wl.selectedProviderId);

    if (provider) {
      const capability = provider.capabilityDetails.find(
        (capability) => capability.profile === wl.profile && capability.region === wl.region
      );

      if (capability) {
        hourlyRate += capability.priceValueUsd;
      }
    }
  }

  const dailyRate = hourlyRate * 24;
  const projectedMonthly = dailyRate * 30;

  return {
    dailyRateUsd: Math.round(dailyRate * 100) / 100,
    projectedMonthlyUsd: Math.round(projectedMonthly * 100) / 100,
    runningWorkloadCount: tenantWorkloads.length
  };
}
