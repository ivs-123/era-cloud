import type { ProviderAdapter } from "./adapter.js";
import { ThunderComputeAdapter } from "./thunder-compute.js";

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

  return registry;
}
