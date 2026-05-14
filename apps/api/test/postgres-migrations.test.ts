import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(testDir, "../../../infra/postgres/migrations");

describe("PostgreSQL migrations", () => {
  it("apply cleanly in order", async () => {
    const db = new PGlite();

    try {
      const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

      for (const file of files) {
        const sql = await readFile(path.join(migrationsDir, file), "utf8");
        await db.exec(sql);
      }

      const result = await db.query<{ table_name: string }>(
        `select table_name
         from information_schema.tables
         where table_schema = 'public'
         order by table_name`
      );

      expect(result.rows.map((row) => row.table_name)).toEqual(
        expect.arrayContaining([
          "tenants",
          "providers",
          "provider_capabilities",
          "workloads",
          "usage_events",
          "billing_periods",
          "invoices",
          "invoice_lines",
          "tenant_keys"
        ])
      );
    } finally {
      await db.close();
    }
  }, 30_000);
});
