import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import electron from "vite-plugin-electron/simple";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    electron({
      main: {
        entry: "electron/main/index.ts",
      },

      preload: {
        input: "electron/preload/index.ts",
      },

      renderer: {},
    }),
  ],
});