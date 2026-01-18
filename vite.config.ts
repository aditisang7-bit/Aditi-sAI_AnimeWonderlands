import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env so your existing code (services/supabaseClient.ts) works
      'process.env': env
    },
    build: {
      outDir: 'dist',
      // Increase limit to 4MB to silence warnings for heavy AI apps
      chunkSizeWarningLimit: 4096,
      rollupOptions: {
        output: {
          // Robust function-based chunk splitting
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Split specific large vendors
              if (id.includes('@google/genai')) {
                return 'vendor-genai';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-ui';
              }
              // Group remaining node_modules to keep the main index.js light
              return 'vendor-libs';
            }
          }
        }
      }
    }
  };
});