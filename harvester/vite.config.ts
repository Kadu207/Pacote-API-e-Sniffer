// @lovable.dev/vite-tanstack-config — ver comentário no topo do arquivo original.
import path from "node:path";
import os from "node:os";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Cache fora do OneDrive evita EEXIST em node_modules/.vite-temp
const viteCacheDir = path.join(os.tmpdir(), "scouttapi-harvester-vite");

export default defineConfig({
  // Gera .output/ para deploy Cloudflare (sem contexto Lovable local)
  nitro: true,
  vite: {
    cacheDir: viteCacheDir,
    server: {
      host: true,
      port: 8080,
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
