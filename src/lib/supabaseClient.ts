
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — auth disabled');
    // Create a dummy client with a placeholder URL to prevent crashes
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };
