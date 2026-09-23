/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    // CodeMirror breaks if two copies of @codemirror/state end up in the bundle.
    dedupe: ["react", "react-dom", "@codemirror/state", "@codemirror/view", "@codemirror/lang-html"],
  },
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 5173,
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
