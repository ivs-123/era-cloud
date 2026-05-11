import type { ProviderAdapter } from "./adapter.js";
import { ThunderComputeAdapter } from "./thunder-compute.js";
import { allProviderAdapters } from "./all-adapters.js";
import { inferenceAdapters, edgeAdapters, marketplaceAdapters } from "./inference-adapters.js";

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

export function createProviderRegistry(config: { thunderApiUrl?: string; thunderApiToken?: string }): ProviderRegistry {
  const registry = new ProviderRegistry();

  if (config.thunderApiUrl && config.thunderApiToken) {
    registry.register(
      new ThunderComputeAdapter({
        apiUrl: config.thunderApiUrl,
        apiToken: config.thunderApiToken
      })
    );
  }

  for (const adapter of allProviderAdapters) {
    registry.register(adapter);
  }

  for (const adapter of inferenceAdapters) {
    registry.register(adapter);
  }

  for (const adapter of edgeAdapters) {
    registry.register(adapter);
  }

  for (const adapter of marketplaceAdapters) {
    registry.register(adapter);
  }

  return registry;
}
