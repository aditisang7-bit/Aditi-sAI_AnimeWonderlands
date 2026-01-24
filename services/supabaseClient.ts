import { createClient } from '@supabase/supabase-js';

// Fallback credentials provided for "Aditi's AI Anime Wonderlands+"
// These ensure the app works even if environment variables are not injected correctly by the build tool.
const FALLBACK_URL = "https://fkpjrnwrnfutejlpgwsp.supabase.co";
const FALLBACK_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcGpybndybmZ1dGVqbHBnd3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjA3MTQsImV4cCI6MjA4NDgzNjcxNH0.HCFACwr7tGcjvr_j3wHJSLTUY3AM_27T_4NZgNRoCmg";

// Helper to safely get env vars without crashing if process is undefined
const getEnvVar = (key: string) => {
  try {
    return process.env[key];
  } catch (e) {
    return undefined;
  }
};

const envUrl = getEnvVar('REACT_APP_SUPABASE_URL') || getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const envKey = getEnvVar('REACT_APP_SUPABASE_ANON_KEY') || getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Use env var if available, otherwise use hardcoded fallback
const supabaseUrl = envUrl || FALLBACK_URL;
const supabaseAnonKey = envKey || FALLBACK_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.error('CRITICAL: Supabase credentials missing. Authentication will fail.');
}

// Initialize the Supabase client
// We provide placeholders as a last resort to prevent the app from crashing with "supabaseUrl is required"
// The isSupabaseConfigured flag handles the UI state for auth.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);