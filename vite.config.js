
import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({

  root: "src",
  envDir: '../',
  build: {
    target: "esnext",
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        health: resolve(__dirname, "src/Health&Activities/index.html"), 
      },
    },
  },
});
