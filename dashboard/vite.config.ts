import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  plugins: [react()],
  server: { port: 5175 },
  build: {
    outDir: path.resolve(root, "../dist-dashboard"),
    emptyOutDir: true,
  },
});
