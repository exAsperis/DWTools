import { resolve } from "node:path";
import { defineConfig } from "vite";

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
      },
    },
  },
});
