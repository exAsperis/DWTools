import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const buildVersion = "1.3.19";

export default defineConfig({
  base: "/",
  plugins: [
    {
      name: "serve-local-manifest",
      apply: "serve",
      configureServer(server) {
        server.middlewares.use("/manifest.local.json", (_request, response) => {
          response.setHeader("Content-Type", "application/json");
          response.end(
            readFileSync(resolve(__dirname, "manifest.local.json"), "utf8"),
          );
        });
      },
    },
  ],
  test: {
    setupFiles: ["./src/testSetup.ts"],
  },
  server: {
    cors: {
      origin: "https://www.owlbear.rodeo",
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        background: resolve(__dirname, "background.html"),
        contextMenu: resolve(__dirname, "context-menu.html"),
      },
      output: {
        entryFileNames: `assets/[name]-${buildVersion}.js`,
        chunkFileNames: `assets/[name]-${buildVersion}.js`,
        assetFileNames: `assets/[name]-${buildVersion}[extname]`,
      },
    },
  },
});
