import type { ApiConfig } from "../config.js";
import { MemoryStore } from "./memory-store.js";
import { PgliteStore } from "./pglite-store.js";
import { PostgresStore } from "./postgres-store.js";
import type { EraStore } from "./store.js";

export async function createStore(config: ApiConfig): Promise<EraStore> {
  if (config.storageDriver === "postgres") {
    if (!config.databaseUrl) {
      throw new Error("DATABASE_URL is required when STORAGE_DRIVER=postgres");
    }

    return new PostgresStore(config.databaseUrl);
  }

  if (config.storageDriver === "pglite") {
    return PgliteStore.create(config.pgliteDataDir);
  }

  return new MemoryStore();
}
