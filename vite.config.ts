import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => ({
  base: '/',

  server: {
    port: 8080,
  },

  plugins: [
    react({
      swcOptions: {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
              refresh: mode === 'development',
              development: mode === 'development',
            },
          },
        },
      },
    }),
    mode === "development" && componentTagger(),
    mode === "production" && viteCompression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),
    mode === "production" && viteCompression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 }),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
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
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('framer-motion')) return 'animation-vendor';

          if (id.includes('@supabase') || id.includes('supabase')) return 'supabase-vendor';

          if (id.includes('recharts') || id.includes('d3')) return 'charts-vendor';

          if (id.includes('@radix-ui')) return 'radix-vendor';

          if (id.includes('lucide-react')) return 'icons-vendor';

          if (id.includes('react-router-dom') || id.includes('react-router')) return 'router-vendor';

          if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) return 'forms-vendor';

          return undefined;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    chunkSizeWarningLimit: 300,
    reportCompressedSize: true,
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
      'date-fns',
      'sonner',
    ],
    exclude: ['framer-motion'],
  },
}));
