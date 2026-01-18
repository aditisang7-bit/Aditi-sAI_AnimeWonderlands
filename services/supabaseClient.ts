import { createClient } from '@supabase/supabase-js';

// Support both REACT_APP_ (CRA) and NEXT_PUBLIC_ (Next.js/Vercel) prefixes
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables are missing. The application is running in "Offline/Demo" mode. Authentication and database features will be disabled.'
  );
}

// Use placeholders to prevent the app from crashing during initialization.
// Service calls will fail gracefully if proper guards (isSupabaseConfigured) are not used.
const url = supabaseUrl || 'https://placeholder-project.supabase.co';
const key = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(url, key);