import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Separate build target for publishing as a Claude Artifact: no PWA/service
// worker (meaningless on that host), relative asset paths, fixed filenames
// so the hand-written artifact index.html can reference them directly.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist-artifact",
    assetsDir: ".",
    rollupOptions: {
      output: {
        entryFileNames: "app.js",
        assetFileNames: "app.[ext]",
      },
    },
  },
});
