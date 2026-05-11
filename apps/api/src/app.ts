import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerHealthRoutes } from "./routes/health.js";
import { registerProviderRoutes } from "./routes/providers.js";
import { registerProviderBridgeRoutes } from "./routes/provider-bridge.js";
import { registerRoutingRoutes } from "./routes/routing.js";
import { registerTenantRoutes } from "./routes/tenants.js";
import { registerWorkloadRoutes } from "./routes/workloads.js";
import { registerBillingRoutes } from "./routes/billing.js";
import { registerBenchmarkRoutes } from "./routes/benchmark.js";
import { loadConfig, type ApiConfig } from "./config.js";
import { createStore } from "./storage/index.js";
import { createProviderRegistry } from "./providers/registry.js";

export async function buildApp(config: ApiConfig = loadConfig()) {
  const app = Fastify({
    logger: true
  });

  const store = await createStore(config);
  const providerRegistry = createProviderRegistry({
    thunderApiUrl: config.thunderApiUrl,
    thunderApiToken: config.thunderApiToken
  });

  app.addHook("onClose", async () => {
    await store.close?.();
  });

  await app.register(cors, {
    origin: true
  });

  await registerHealthRoutes(app);
  await registerTenantRoutes(app, store);
  await registerProviderRoutes(app, store);
  await registerRoutingRoutes(app, store);
  await registerWorkloadRoutes(app, store);
  await registerProviderBridgeRoutes(app, store, providerRegistry);
  await registerBillingRoutes(app, store);
  await registerBenchmarkRoutes(app, store);

  return app;
}
