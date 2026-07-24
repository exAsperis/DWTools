import { resolve } from "node:path";
import { defineConfig } from "vite";

const buildVersion = "0.1.2";

export default defineConfig({
  base: "/DWTools/",
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
