import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { PgliteStore } from "../src/storage/pglite-store.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "../../..");

describe("PGlite storage driver", () => {
  it("persists tenants and auth users across app restarts", async () => {
    const dataDir = await mkdtemp(path.join(os.tmpdir(), "era-pglite-"));

    try {
      const firstApp = await buildApp({
        host: "127.0.0.1",
        port: 0,
        storageDriver: "pglite",
        pgliteDataDir: dataDir
      });

      const registerResponse = await firstApp.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          tenant_name: "Persistent Tenant",
          email: "persistent@example.com",
          password: "pass123456"
        }
      });

      expect(registerResponse.statusCode).toBe(201);
      const tenantId = registerResponse.json().data.tenant_id as string;
      await firstApp.close();

      const secondApp = await buildApp({
        host: "127.0.0.1",
        port: 0,
        storageDriver: "pglite",
        pgliteDataDir: dataDir
      });

      const loginResponse = await secondApp.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: "persistent@example.com",
          password: "pass123456"
        }
      });

      expect(loginResponse.statusCode).toBe(200);
      expect(loginResponse.json().data.tenant_id).toBe(tenantId);
      await secondApp.close();
    } finally {
      await rm(dataDir, { force: true, recursive: true });
    }
  }, 30_000);

  it("locates migrations when started from the repo root", async () => {
    const dataDir = await mkdtemp(path.join(os.tmpdir(), "era-pglite-root-cwd-"));
    const previousCwd = process.cwd();
    let store: PgliteStore | undefined;

    try {
      process.chdir(repoRoot);
      store = await PgliteStore.create(dataDir);

      const tenant = await store.createTenant({ name: "Root CWD Tenant" });
      expect(tenant.name).toBe("Root CWD Tenant");
    } finally {
      await store?.close();
      process.chdir(previousCwd);
      await rm(dataDir, { force: true, recursive: true });
    }
  }, 30_000);
});
