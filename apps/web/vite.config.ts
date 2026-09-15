import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Legacy XI",
        short_name: "Legacy XI",
        description: "Live an entire football career, one season at a time.",
        theme_color: "#0a0d0b",
        background_color: "#0a0d0b",
        display: "standalone",
        icons: [],
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
