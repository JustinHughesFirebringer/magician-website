import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { TypedSupabaseClient } from './types';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient(): TypedSupabaseClient {
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  });
}

// Create a single supabase client for interacting with your database
export const supabase = createClient();
