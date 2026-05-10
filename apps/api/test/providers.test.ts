import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("providers API", () => {
  it("registers and lists providers", async () => {
    const app = await buildApp();

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/admin/providers",
      payload: {
        name: "Mock Inference",
        type: "inference",
        status: "healthy",
        regions: ["eu-central"],
        capabilities: ["llm-text-gen-small"]
      }
    });

    expect(createResponse.statusCode).toBe(201);

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/providers"
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().data).toHaveLength(1);

    await app.close();
  });
});

