import { createClient } from '@supabase/supabase-js';

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

const supabaseUrl = envUrl;
const supabaseAnonKey = envKey;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials missing. Authentication will be disabled.');
}

// Initialize the Supabase client
// We provide placeholders to prevent the app from crashing immediately if config is missing.
// The isSupabaseConfigured flag handles the UI state for auth.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);