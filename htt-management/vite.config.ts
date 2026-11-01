import { execFileSync } from "node:child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import electron from "vite-plugin-electron/simple";

const webOnly = process.env.WEB_ONLY === "1";

export default defineConfig({
  define: { "import.meta.env.VITE_WEB_ONLY": JSON.stringify(webOnly ? "1" : "0") },
  build: { outDir: webOnly ? "dist-web" : "dist" },
  server: { proxy: { "/api": { target: "http://127.0.0.1:" + (process.env.API_PORT || "8787") } } },
  plugins: [
    ...(!webOnly
      ? [{
          name: "local-capture-ocr",
          apply: "build" as const,
          buildStart() {
            execFileSync(
              process.execPath,
              ["scripts/build-capture-ocr.mjs"],
              { stdio: "inherit" },
            );
          },
        }]
      : []),

    react(),
    tailwindcss(),

    ...(!webOnly
      ? [electron({
          main: {
            entry: "electron/main/index.ts",
          },
          preload: {
            input: "electron/preload/index.ts",
          },
          renderer: {},
        })]
      : []),
  ],
});