import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

async function register(app: Awaited<ReturnType<typeof buildApp>>, email: string) {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/register",
    payload: {
      tenant_name: `Tenant ${email}`,
      email,
      password: "pass123456"
    }
  });

  expect(response.statusCode).toBe(201);
  return response.json().data as { token: string; tenant_id: string };
}

describe("auth and tenant isolation", () => {
  const originalSkipAuth = process.env.SKIP_AUTH;

  afterEach(() => {
    if (originalSkipAuth === undefined) {
      delete process.env.SKIP_AUTH;
    } else {
      process.env.SKIP_AUTH = originalSkipAuth;
    }
  });

  it("requires bearer auth for operational API routes", async () => {
    process.env.SKIP_AUTH = "false";
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/providers"
    });

    expect(response.statusCode).toBe(401);

    await app.close();
  });

  it("allows unauthenticated health checks", async () => {
    process.env.SKIP_AUTH = "false";
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/health"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe("ok");

    await app.close();
  });

  it("allows authenticated tenants to access operational API routes", async () => {
    process.env.SKIP_AUTH = "false";
    const app = await buildApp();
    const auth = await register(app, "owner@example.com");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/providers",
      headers: {
        authorization: `Bearer ${auth.token}`
      }
    });

    expect(response.statusCode).toBe(200);

    await app.close();
  });

  it("rejects cross-tenant billing access", async () => {
    process.env.SKIP_AUTH = "false";
    const app = await buildApp();
    const first = await register(app, "first@example.com");
    const second = await register(app, "second@example.com");

    const response = await app.inject({
      method: "GET",
      url: `/api/v1/billing/estimate?tenant_id=${encodeURIComponent(second.tenant_id)}`,
      headers: {
        authorization: `Bearer ${first.token}`
      }
    });

    expect(response.statusCode).toBe(403);

    await app.close();
  });
});
