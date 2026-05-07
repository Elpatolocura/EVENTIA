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
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // Large UI libraries in separate chunks
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            // React and core libraries
            if (id.includes('react') || id.includes('@tanstack/react-query')) {
              return 'react-vendor';
            }
            // Framer Motion (heavy animation library)
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            // Supabase
            if (id.includes('supabase')) {
              return 'supabase-vendor';
            }
            // Other node_modules
            return 'vendor';
          }
          // Application chunks
          if (id.includes('src/pages/')) {
            // Group related pages
            if (id.includes('HomePage') || id.includes('ExplorePage') || id.includes('EventDetailPage')) {
              return 'events-pages';
            }
            if (id.includes('AuthPage') || id.includes('ProfilePage') || id.includes('SettingsPage')) {
              return 'auth-pages';
            }
            if (id.includes('ChatPage') || id.includes('ChatRoomPage')) {
              return 'chat-pages';
            }
            return 'other-pages';
          }
          // Large components
          if (id.includes('src/components/EventCard') || id.includes('src/components/BottomNav')) {
            return 'core-components';
          }
        }
      }
    },
    chunkSizeWarningLimit: 500, // Lower threshold to catch issues earlier
  },
}));
