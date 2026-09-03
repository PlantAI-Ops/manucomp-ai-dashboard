// vite.config.ts
import { defineConfig } from "file:///C:/Users/MY%20PC/Documents/GitHub/manucomp-ai-dashboard/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/MY%20PC/Documents/GitHub/manucomp-ai-dashboard/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/MY%20PC/Documents/GitHub/manucomp-ai-dashboard/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\MY PC\\Documents\\GitHub\\manucomp-ai-dashboard";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const module = id.toString().split("node_modules/")[1].split("/")[0].toString();
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
        }
      }
    },
    chunkSizeWarningLimit: 1e3
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNWSBQQ1xcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXG1hbnVjb21wLWFpLWRhc2hib2FyZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcTVkgUENcXFxcRG9jdW1lbnRzXFxcXEdpdEh1YlxcXFxtYW51Y29tcC1haS1kYXNoYm9hcmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL01ZJTIwUEMvRG9jdW1lbnRzL0dpdEh1Yi9tYW51Y29tcC1haS1kYXNoYm9hcmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiBcIjo6XCIsXHJcbiAgICBwb3J0OiA4MDgwLFxyXG4gICAgaG1yOiB7XHJcbiAgICAgIG92ZXJsYXk6IGZhbHNlLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCldLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlc1wiKSkge1xyXG4gICAgICAgICAgICBjb25zdCBtb2R1bGUgPSBpZC50b1N0cmluZygpLnNwbGl0KFwibm9kZV9tb2R1bGVzL1wiKVsxXS5zcGxpdChcIi9cIilbMF0udG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgLy8gR3JvdXAgcmVsYXRlZCBwYWNrYWdlc1xyXG4gICAgICAgICAgICBpZiAoW1wicmVjaGFydHNcIiwgXCJkMy1zY2FsZVwiLCBcImQzLWFycmF5XCIsIFwiZDMtdGltZVwiLCBcImQzLWZvcm1hdFwiLCBcImQzLWludGVycG9sYXRlXCIsIFwiZDMtcGF0aFwiLCBcImQzLXNoYXBlXCIsIFwiZDMtY29sb3JcIiwgXCJkMy10aW1lLWZvcm1hdFwiLCBcInJlYWN0LXNtb290aFwiLCBcInZpY3RvcnktdmVuZG9yXCIsIFwiZGVjaW1hbC5qcy1saWdodFwiXS5pbmNsdWRlcyhtb2R1bGUpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFwiY2hhcnRzXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKFtcIkByYWRpeC11aVwiLCBcIkBmbG9hdGluZy11aVwiLCBcImFyaWEtaGlkZGVuXCIsIFwicmVhY3QtcmVtb3ZlLXNjcm9sbFwiLCBcInJlYWN0LXN0eWxlLXNpbmdsZXRvblwiLCBcInVzZS1zaWRlY2FyXCIsIFwidXNlLWNhbGxiYWNrLXJlZlwiLCBcInVzZS1zeW5jLWV4dGVybmFsLXN0b3JlXCJdLmluY2x1ZGVzKG1vZHVsZSkpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gXCJyYWRpeC11aVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiLCBcInNjaGVkdWxlclwiLCBcInJlYWN0LWlzXCIsIFwicmVhY3Qtcm91dGVyXCIsIFwicmVhY3Qtcm91dGVyLWRvbVwiLCBcIkByZW1peC1ydW5cIl0uaW5jbHVkZXMobW9kdWxlKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBcInJlYWN0LWNvcmVcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoW1wibHVjaWRlLXJlYWN0XCIsIFwiY2xzeFwiLCBcInRhaWx3aW5kLW1lcmdlXCIsIFwiY2xhc3MtdmFyaWFuY2UtYXV0aG9yaXR5XCIsIFwicHJvcC10eXBlc1wiLCBcIm5leHQtdGhlbWVzXCIsIFwic29ubmVyXCJdLmluY2x1ZGVzKG1vZHVsZSkpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gXCJ1aS1saWJzXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKFtcImF4aW9zXCIsIFwiQHRhbnN0YWNrXCIsIFwiem9kXCIsIFwiZGF0ZS1mbnNcIiwgXCJsb2Rhc2hcIiwgXCJyZWFjdC1kYXktcGlja2VyXCIsIFwicmVhY3QtbWFya2Rvd25cIiwgXCJyZWFjdC1ob29rLWZvcm1cIiwgXCJAaG9va2Zvcm1cIl0uaW5jbHVkZXMobW9kdWxlKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBcInV0aWxzXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG1vZHVsZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICB9LFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1YsU0FBUyxvQkFBb0I7QUFDNVgsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxJQUNYO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLGlCQUFpQixnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQzlFLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGFBQWEsSUFBSTtBQUNmLGNBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUMvQixrQkFBTSxTQUFTLEdBQUcsU0FBUyxFQUFFLE1BQU0sZUFBZSxFQUFFLENBQUMsRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLEVBQUUsU0FBUztBQUU5RSxnQkFBSSxDQUFDLFlBQVksWUFBWSxZQUFZLFdBQVcsYUFBYSxrQkFBa0IsV0FBVyxZQUFZLFlBQVksa0JBQWtCLGdCQUFnQixrQkFBa0Isa0JBQWtCLEVBQUUsU0FBUyxNQUFNLEdBQUc7QUFDOU0scUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksQ0FBQyxhQUFhLGdCQUFnQixlQUFlLHVCQUF1Qix5QkFBeUIsZUFBZSxvQkFBb0IseUJBQXlCLEVBQUUsU0FBUyxNQUFNLEdBQUc7QUFDL0sscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksQ0FBQyxTQUFTLGFBQWEsYUFBYSxZQUFZLGdCQUFnQixvQkFBb0IsWUFBWSxFQUFFLFNBQVMsTUFBTSxHQUFHO0FBQ3RILHFCQUFPO0FBQUEsWUFDVDtBQUNBLGdCQUFJLENBQUMsZ0JBQWdCLFFBQVEsa0JBQWtCLDRCQUE0QixjQUFjLGVBQWUsUUFBUSxFQUFFLFNBQVMsTUFBTSxHQUFHO0FBQ2xJLHFCQUFPO0FBQUEsWUFDVDtBQUNBLGdCQUFJLENBQUMsU0FBUyxhQUFhLE9BQU8sWUFBWSxVQUFVLG9CQUFvQixrQkFBa0IsbUJBQW1CLFdBQVcsRUFBRSxTQUFTLE1BQU0sR0FBRztBQUM5SSxxQkFBTztBQUFBLFlBQ1Q7QUFDQSxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLHVCQUF1QjtBQUFBLEVBQ3pCO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
