import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { loadConfig } from "../config.js";

const { Pool } = pg;
const config = loadConfig();

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL is required to run migrations");
}

const pool = new Pool({ connectionString: config.databaseUrl });
const migrationsDir = path.resolve(process.cwd(), "../../infra/postgres/migrations");

try {
  await pool.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const applied = await pool.query("select filename from schema_migrations");
  const appliedNames = new Set(applied.rows.map((row) => row.filename as string));
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    if (appliedNames.has(file)) {
      continue;
    }

    const sql = await readFile(path.join(migrationsDir, file), "utf8");

    await pool.query("begin");
    try {
      await pool.query(sql);
      await pool.query("insert into schema_migrations (filename) values ($1)", [file]);
      await pool.query("commit");
      console.log(`Applied migration ${file}`);
    } catch (error) {
      await pool.query("rollback");
      throw error;
    }
  }

  if (files.every((file) => appliedNames.has(file))) {
    console.log("No pending migrations");
  }
} finally {
  await pool.end();
}
