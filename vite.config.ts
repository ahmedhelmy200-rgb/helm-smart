import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    base: "./",

    server: {
      port: 3000,
      host: "0.0.0.0",
    },

    plugins: [react()],

    define: {},

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },

    build: {
      // Faster initial load + smaller main bundle (especially inside Electron)
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            charts: ["recharts"],
          },
        },
      },
    },
  };
});
