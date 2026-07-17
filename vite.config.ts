import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const module = id.toString().split("node_modules/")[1].split("/")[0].toString();
            // Group related packages
            if (["recharts", "d3-scale", "d3-array", "d3-time", "d3-format", "d3-interpolate", "d3-path", "d3-shape", "d3-color", "d3-time-format", "react-smooth", "victory-vendor", "decimal.js-light"].includes(module)) {
              return "charts";
            }
            if (["@radix-ui", "@floating-ui", "aria-hidden", "react-remove-scroll", "react-style-singleton", "use-sidecar", "use-callback-ref", "use-sync-external-store"].includes(module)) {
              return "radix-ui";
            }
            if (["react", "react-dom", "scheduler", "react-is", "react-router", "react-router-dom", "@remix-run"].includes(module)) {
              return "react-core";
            }
            if (["lucide-react", "clsx", "tailwind-merge", "class-variance-authority", "prop-types", "next-themes", "sonner"].includes(module)) {
              return "ui-libs";
            }
            if (["axios", "@tanstack", "zod", "date-fns", "lodash", "react-day-picker", "react-markdown", "react-hook-form", "@hookform"].includes(module)) {
              return "utils";
            }
            return module;
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
