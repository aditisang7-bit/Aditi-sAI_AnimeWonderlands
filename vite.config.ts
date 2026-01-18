import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Safely stringify the env object so 'process.env' becomes a valid JS object in the browser
      'process.env': JSON.stringify(env)
    },
    build: {
      outDir: 'dist',
      // Increase limit to 4MB to silence warnings
      chunkSizeWarningLimit: 4096,
      rollupOptions: {
        output: {
          // Robust chunk splitting
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Split huge independent libraries
              if (id.includes('@google/genai')) {
                return 'vendor-genai';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              // Group Core React deps to avoid initialization order issues
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                  return 'vendor-react';
              }
              return 'vendor-libs';
            }
          }
        }
      }
    }
  };
});