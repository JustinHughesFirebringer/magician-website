import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type Magician = Database['public']['Tables']['magicians']['Row'];

export async function getMagiciansByLocation(city: string, state: string): Promise<Magician[]> {
  try {
    const { data, error } = await supabase
      .from('magicians')
      .select('*')
      .eq('city', city)
      .eq('state', state);

    if (error) {
      console.error('Error fetching magicians:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMagiciansByLocation:', error);
    return [];
  }
}

export async function searchMagicians(
  query?: string,
  city?: string,
  state?: string,
  limit: number = 50
): Promise<Magician[]> {
  try {
    let search = supabase
      .from('magicians')
      .select('*')
      .limit(limit);

    if (query) {
      search = search.ilike('name', `%${query}%`);
    }
    if (city) {
      search = search.eq('city', city);
    }
    if (state) {
      search = search.eq('state', state);
    }

    const { data, error } = await search;
    
    if (error) {
      console.error('Error fetching magicians:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchMagicians:', error);
    return [];
  }
}

export async function getMagicianById(id: string) {
  try {
    const { data, error } = await supabase
      .from('magicians')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching magician by id:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in getMagicianById:', err);
    return null;
  }
}

export async function getMagicianBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('magicians')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching magician by slug:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in getMagicianBySlug:', err);
    return null;
  }
}

export async function getLocations() {
  try {
    const { data, error } = await supabase
      .from('magicians')
      .select('city, state')
      .order('state')
      .order('city');

    if (error) {
      console.error('Error fetching locations:', error);
      return [];
    }

    // Group locations by state
    const locationsByState = data.reduce((acc, { city, state }) => {
      if (!acc[state]) {
        acc[state] = new Set();
      }
      acc[state].add(city);
      return acc;
    }, {} as Record<string, Set<string>>);

    // Convert to array format and sort
    return Object.entries(locationsByState).map(([state, cities]) => ({
      state,
      cities: Array.from(cities).sort()
    }));
  } catch (err) {
    console.error('Error in getLocations:', err);
    return [];
  }
}
