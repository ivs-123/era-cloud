import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

async function seedTenant(app: Awaited<ReturnType<typeof buildApp>>) {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/tenants",
    payload: { name: "Acme AI" }
  });

  return response.json().data.id as string;
}

async function seedProviders(app: Awaited<ReturnType<typeof buildApp>>) {
  await app.inject({
    method: "POST",
    url: "/api/v1/admin/providers",
    payload: {
      name: "Cheap GPU",
      type: "inference",
      status: "healthy",
      regions: ["eu-central"],
      capabilities: ["llm-text-gen-small"],
      capability_details: [
        {
          region: "eu-central",
          profile: "llm-text-gen-small",
          priceUnit: "hour",
          priceValueUsd: 0.8,
          latencyP50Ms: 1400,
          isAvailable: true
        }
      ]
    }
  });

  await app.inject({
    method: "POST",
    url: "/api/v1/admin/providers",
    payload: {
      name: "Fast GPU",
      type: "inference",
      status: "healthy",
      regions: ["eu-central"],
      capabilities: ["llm-text-gen-small"],
      capability_details: [
        {
          region: "eu-central",
          profile: "llm-text-gen-small",
          priceUnit: "hour",
          priceValueUsd: 1.6,
          latencyP50Ms: 350,
          isAvailable: true
        }
      ]
    }
  });
}

describe("routing and workloads API", () => {
  it("simulates low-latency routing", async () => {
    const app = await buildApp();
    await seedProviders(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/routing/simulate",
      payload: {
        kind: "inference",
        profile: "llm-text-gen-small",
        region: "eu-central",
        routing_policy: "low-latency"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.ranked_candidates[0].provider_name).toBe("Fast GPU");

    await app.close();
  });

  it("creates a workload with a persisted routing decision", async () => {
    const app = await buildApp();
    const tenantId = await seedTenant(app);
    await seedProviders(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/workloads",
      payload: {
        tenant_id: tenantId,
        kind: "inference",
        profile: "llm-text-gen-small",
        region: "eu-central",
        routing_policy: "cheapest",
        metadata: { project: "assistant-api" }
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.state).toBe("provisioning");

    await app.close();
  });

  it("stops a workload idempotently", async () => {
    const app = await buildApp();
    const tenantId = await seedTenant(app);
    await seedProviders(app);

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/workloads",
      payload: {
        tenant_id: tenantId,
        kind: "inference",
        profile: "llm-text-gen-small",
        region: "eu-central",
        routing_policy: "balanced"
      }
    });

    const workloadId = createResponse.json().data.id as string;

    const firstStop = await app.inject({
      method: "POST",
      url: `/api/v1/workloads/${workloadId}/stop`
    });

    const secondStop = await app.inject({
      method: "POST",
      url: `/api/v1/workloads/${workloadId}/stop`
    });

    expect(firstStop.statusCode).toBe(200);
    expect(firstStop.json().data.state).toBe("stopped");
    expect(secondStop.statusCode).toBe(200);
    expect(secondStop.json().data.state).toBe("stopped");

    await app.close();
  });

  it("returns 409 when no provider matches constraints", async () => {
    const app = await buildApp();
    await seedProviders(app);

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/routing/simulate",
      payload: {
        kind: "inference",
        profile: "llm-text-gen-small",
        region: "us-west",
        routing_policy: "balanced"
      }
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error).toBe("NO_CAPACITY_MATCH");

    await app.close();
  });
});
