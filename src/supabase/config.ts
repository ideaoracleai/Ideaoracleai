// Supabase Configuration for IdeaOracle.ai
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '[IdeaOracle] Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).',
        'Auth features will not work. Create a .env file with these variables.'
    );
}

// Create client even with empty strings — public pages will still render.
// Auth/DB calls will simply fail gracefully if credentials are missing.
export const supabase = createClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    }
);

export default supabase;
