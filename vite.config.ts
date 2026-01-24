import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // This picks up .env files locally.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // User Provided Supabase Credentials
  const SUPABASE_URL = "https://fkpjrnwrnfutejlpgwsp.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcGpybndybmZ1dGVqbHBnd3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjA3MTQsImV4cCI6MjA4NDgzNjcxNH0.HCFACwr7tGcjvr_j3wHJSLTUY3AM_27T_4NZgNRoCmg";

  return {
    plugins: [react()],
    define: {
      // CRITICAL FOR VERCEL DEPLOYMENT:
      // Vercel exposes environment variables via process.env during build.
      // We must explicitly replace 'process.env.VARIABLE' in the client code with the actual value.
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY),
      // Inject Supabase credentials (using env vars if present, else falling back to hardcoded user keys)
      'process.env.REACT_APP_SUPABASE_URL': JSON.stringify(process.env.REACT_APP_SUPABASE_URL || env.REACT_APP_SUPABASE_URL || SUPABASE_URL),
      'process.env.REACT_APP_SUPABASE_ANON_KEY': JSON.stringify(process.env.REACT_APP_SUPABASE_ANON_KEY || env.REACT_APP_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY),
      'process.env.REACT_APP_RAZORPAY_KEY_ID': JSON.stringify(process.env.REACT_APP_RAZORPAY_KEY_ID || env.REACT_APP_RAZORPAY_KEY_ID),
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