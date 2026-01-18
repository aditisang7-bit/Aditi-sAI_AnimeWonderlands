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
      // Increase the warning limit to 3000kb (3MB) to handle large GenAI & Supabase libraries
      // This stops Vercel/Vite from warning about "large chunks" during build
      chunkSizeWarningLimit: 3000,
      rollupOptions: {
        output: {
          // Split large dependencies into separate files for better loading performance
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['lucide-react'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-genai': ['@google/genai']
          }
        }
      }
    }
  };
});