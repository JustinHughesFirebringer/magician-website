import { createClient } from '../supabase/client';
import type { Database } from '../../types/database';
import type { Magician } from '../../types/magician';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseKey) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient();

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
