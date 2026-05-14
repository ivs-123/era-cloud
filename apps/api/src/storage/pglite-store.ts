import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { PostgresStore, type QueryClientLike, type QueryPoolLike, type QueryResultLike } from "./postgres-store.js";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

class PglitePoolAdapter implements QueryPoolLike {
  constructor(private db: PGlite) {}

  async query<T = any>(sql: string, values?: unknown[]): Promise<QueryResultLike<T>> {
    const result = await this.db.query<T>(sql, values as any[]);
    return { rows: result.rows };
  }

  async connect(): Promise<QueryClientLike> {
    return {
      query: async <T = any>(sql: string, values?: unknown[]) => this.query<T>(sql, values),
      release: () => {}
    };
  }

  async end(): Promise<void> {
    await this.db.close();
  }
}

export class PgliteStore extends PostgresStore {
  private constructor(pool: QueryPoolLike) {
    super(pool);
  }

  static async create(dataDir?: string): Promise<PgliteStore> {
    const db = new PGlite(dataDir);
    await applyMigrations(db);
    return new PgliteStore(new PglitePoolAdapter(db));
  }
}

async function applyMigrations(db: PGlite) {
  await db.exec(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const applied = await db.query<{ filename: string }>("select filename from schema_migrations");
  const appliedNames = new Set(applied.rows.map((row) => row.filename));
  const migrationsDir = await findMigrationsDir();
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    if (appliedNames.has(file)) {
      continue;
    }

    const sql = await readFile(path.join(migrationsDir, file), "utf8");
    await db.transaction(async (tx) => {
      await tx.exec(sql);
      await tx.query("insert into schema_migrations (filename) values ($1)", [file]);
    });
  }
}

async function findMigrationsDir() {
  const starts = [moduleDir, process.cwd()];
  const seen = new Set<string>();

  for (const start of starts) {
    let current = path.resolve(start);

    while (!seen.has(current)) {
      seen.add(current);
      const candidate = path.join(current, "infra", "postgres", "migrations");

      try {
        await readdir(candidate);
        return candidate;
      } catch {
        const parent = path.dirname(current);
        if (parent === current) {
          break;
        }
        current = parent;
      }
    }
  }

  throw new Error("Could not locate infra/postgres/migrations for PGlite startup");
}
