import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["dotenv/config"],
    env: { DOTENV_CONFIG_PATH: ".env.local" },
  },
  resolve: { alias: { "@": path.resolve(__dirname) } },
});
