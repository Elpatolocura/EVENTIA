import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',

  server: {
    port: 8080,
  },

  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Dedupe ensures only one copy of React exists across all chunks.
    // This is the correct place to prevent duplicate-React issues.
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },

  build: {
    // Let Rollup determine chunk splitting automatically based on the real
    // dependency graph. Manual chunks caused init-order crashes (forwardRef /
    // createContext undefined) because Rollup cannot guarantee which chunk
    // the browser evaluates first when they are peers.
    //
    // We only split out libraries that are TRULY independent of React at
    // module-initialization time so there is no risk of ordering issues.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          // Framer Motion — large, self-contained, no React init-time side-effects
          if (id.includes('framer-motion')) return 'animation-vendor';

          // Supabase — has zero React dependency
          if (id.includes('@supabase') || id.includes('supabase')) return 'supabase-vendor';

          // Everything else (React, Radix, TanStack, lucide, etc.) is left to
          // Rollup's automatic chunking so dependency order is always correct.
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
