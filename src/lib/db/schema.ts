import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';

const supabaseUrl = 'https://supabase-rose-mountain.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export interface Magician {
  id?: string;
  name: string;
  businessName?: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  phone?: string;
  email?: string;
  description?: string;
  services?: string[];
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  created_at?: string;
  updated_at?: string;
}

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
