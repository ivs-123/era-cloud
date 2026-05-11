import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      SKIP_AUTH: "true"
    }
  }
});
