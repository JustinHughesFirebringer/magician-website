import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';
import type { Magician } from '../../types/magician';

const supabaseUrl = 'https://supabase-rose-mountain.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createSupabaseClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false
    }
  }
) as ReturnType<typeof createSupabaseClient<Database>>;

export async function createMagiciansTable() {
  const { error } = await supabase.rpc('create_magicians_table');
  if (error) {
    throw error;
  }
}

export async function insertMagician(magician: Magician) {
  const { error } = await supabase
    .from('magicians')
    .insert([magician]);
  
  if (error) {
    throw error;
  }
}
