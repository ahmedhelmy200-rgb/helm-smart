import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const isElectron = !!process.env.ELECTRON;

  return {
    plugins: [react()],
    base: isElectron ? "./" : "/",
    server: {
      port: 5173,
      strictPort: true,
      host: true
    },
    preview: {
      port: 4173,
      strictPort: true,
      host: true
    },
    build: {
      outDir: "dist",
      sourcemap: true
    }
  };
});


