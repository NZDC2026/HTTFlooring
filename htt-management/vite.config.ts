import {execFileSync} from 'node:child_process';
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import electron from "vite-plugin-electron/simple";

export default defineConfig({
  plugins: [
    {name:"local-capture-ocr",apply:"build",buildStart(){execFileSync(process.execPath,["scripts/build-capture-ocr.mjs"],{stdio:"inherit"});}},
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