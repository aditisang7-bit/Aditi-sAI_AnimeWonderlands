import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // This picks up .env files locally.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // CRITICAL FOR VERCEL DEPLOYMENT:
      // Vercel exposes environment variables via process.env during build.
      // We must explicitly replace 'process.env.API_KEY' in the client code with the actual value.
      // Priority: process.env.API_KEY (Vercel/System) > env.API_KEY (.env file)
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY),
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 4096,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@google/genai')) return 'vendor-genai';
              if (id.includes('@supabase')) return 'vendor-supabase';
              if (id.includes('react')) return 'vendor-react';
              if (id.includes('lucide')) return 'vendor-icons';
            }
          }
        }
      }
    }
  };
});