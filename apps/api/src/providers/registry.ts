import type { ProviderAdapter } from "./adapter.js";
import type { ProviderTokens } from "../config.js";
import { ThunderComputeAdapter } from "./thunder-compute.js";
import { allProviderAdapters } from "./all-adapters.js";
import { inferenceAdapters, edgeAdapters, marketplaceAdapters } from "./inference-adapters.js";
import { createLiveAdapters } from "./live-adapters.js";

export class ProviderRegistry {
  private adapters = new Map<string, ProviderAdapter>();

  register(adapter: ProviderAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }

  get(name: string): ProviderAdapter | undefined {
    return this.adapters.get(name);
  }

  list(): ProviderAdapter[] {
    return [...this.adapters.values()];
  }

  listByCategory(category: string): ProviderAdapter[] {
    return [...this.adapters.values()].filter((a) => a.category === category);
  }
}

export function createProviderRegistry(config: {
  thunderApiUrl?: string;
  thunderApiToken?: string;
  providerTokens?: ProviderTokens;
}): ProviderRegistry {
  const registry = new ProviderRegistry();

  if (config.thunderApiUrl && config.thunderApiToken) {
    registry.register(
      new ThunderComputeAdapter({
        apiUrl: config.thunderApiUrl,
        apiToken: config.thunderApiToken
      })
    );
  }

  const liveNames = new Set<string>();
  if (config.providerTokens) {
    for (const adapter of createLiveAdapters(config.providerTokens)) {
      registry.register(adapter);
      liveNames.add(adapter.name);
    }
  }

  for (const adapter of allProviderAdapters) {
    if (!liveNames.has(adapter.name)) {
      registry.register(adapter);
    }
  }

  for (const adapter of inferenceAdapters) {
    if (!liveNames.has(adapter.name)) {
      registry.register(adapter);
    }
  }

  for (const adapter of edgeAdapters) {
    registry.register(adapter);
  }

  for (const adapter of marketplaceAdapters) {
    registry.register(adapter);
  }

  return registry;
}
