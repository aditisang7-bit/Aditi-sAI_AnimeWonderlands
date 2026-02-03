import { createClient } from '@supabase/supabase-js';

// Specific fallback credentials for Aditi's AI
const FALLBACK_URL = "https://odicapopaiaijxsnzlvy.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kaWNhcG9wYWlhaWp4c256bHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ5NjMsImV4cCI6MjA4Mzg5MDk2M30.zXARRDd5DH8HkpE_CqVrb3nh9QiAO0LmBxwA_9RxTJU";

// Helper to safely access env vars. 
// We must access properties DIRECTLY (e.g. process.env.REACT_APP_SUPABASE_URL) 
// so that Vite's define plugin can replace them with string literals during build.
const getUrl = () => {
  try {
    return process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  } catch { return undefined; }
};

const getKey = () => {
  try {
    return process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  } catch { return undefined; }
};

// Use Env vars if available (and not undefined string), otherwise use fallback
const rawUrl = getUrl();
const rawKey = getKey();

const supabaseUrl = (rawUrl && rawUrl !== 'undefined') ? rawUrl : FALLBACK_URL;
const supabaseAnonKey = (rawKey && rawKey !== 'undefined') ? rawKey : FALLBACK_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials missing. Authentication will be disabled.');
} else {
  // Safe log to confirm connection (hiding full key)
  console.log(`Aditi's AI: Connected to Supabase at ${supabaseUrl}`);
}

// Initialize the Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);