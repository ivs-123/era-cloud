export interface ApiConfig {
  host: string;
  port: number;
  databaseUrl?: string;
  storageDriver: "memory" | "postgres";
  thunderApiUrl?: string;
  thunderApiToken?: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  return {
    host: env.API_HOST ?? "0.0.0.0",
    port: Number(env.API_PORT ?? 4000),
    databaseUrl: env.DATABASE_URL,
    storageDriver: env.STORAGE_DRIVER === "postgres" ? "postgres" : "memory",
    thunderApiUrl: env.THUNDER_API_URL,
    thunderApiToken: env.THUNDER_API_TOKEN
  };
}
