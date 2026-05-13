import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";

describe("PostgreSQL migrations", () => {
  it("apply cleanly in order", async () => {
    const db = new PGlite();
    const migrationsDir = path.resolve(process.cwd(), "../../infra/postgres/migrations");
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

    await db.close();
  });
});

