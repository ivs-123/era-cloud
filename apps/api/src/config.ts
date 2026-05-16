export interface ProviderTokens {
  deepinfra?: string;
  groq?: string;
  fireworks?: string;
  vastai?: string;
  runpod?: string;
}

export interface ApiConfig {
  host: string;
  port: number;
  databaseUrl?: string;
  pgliteDataDir?: string;
  storageDriver: "memory" | "postgres" | "pglite";
  thunderApiUrl?: string;
  thunderApiToken?: string;
  providerTokens: ProviderTokens;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  return {
    host: env.API_HOST ?? "0.0.0.0",
    port: Number(env.API_PORT ?? 4000),
    databaseUrl: env.DATABASE_URL,
    pgliteDataDir: env.PGLITE_DATA_DIR,
    storageDriver: env.STORAGE_DRIVER === "postgres" ? "postgres" : env.STORAGE_DRIVER === "pglite" ? "pglite" : "memory",
    thunderApiUrl: env.THUNDER_API_URL,
    thunderApiToken: env.THUNDER_API_TOKEN,
    providerTokens: {
      deepinfra: env.DEEPINFRA_API_KEY,
      groq: env.GROQ_API_KEY,
      fireworks: env.FIREWORKS_API_KEY,
      vastai: env.VASTAI_API_KEY,
      runpod: env.RUNPOD_API_KEY
    }
  };
}

export type PartialApiConfig = Partial<ApiConfig> & Pick<ApiConfig, "host" | "port">;
