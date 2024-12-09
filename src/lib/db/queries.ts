import { supabase } from '@/lib/supabase/client';
import type { Magician, MagicianSearchParams, MagicianResponse } from '@/types/magician';
import type { SearchParams, SearchResults, FilterData } from '@/types/search';
import type { Database } from '@/types/database';
import { calculateHaversineDistance } from '../utils';

const isDevelopment = process.env.NODE_ENV === 'development';
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

interface MagicianWithRelations {
  id: string;
  name: string;
  slug: string;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  services: string[] | null;
  created_at: string;
  updated_at: string;
}

// Helper function to format magician data
function formatMagician(data: MagicianWithRelations): Magician {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    business_name: data.business_name,
    email: data.email,
    phone: data.phone,
    website_url: data.website_url,
    description: data.bio || null,
    price_range_min: null,
    price_range_max: null,
    rating: null,
    review_count: null,
    verified: false,
    location: {
      city: data.city || '',
      state: data.state || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0
    },
    services: data.services || [],
    created_at: data.created_at,
    updated_at: data.updated_at,
    image_url: data.avatar_url || null
  };
}

// Haversine formula for calculating distance between two points
const EARTH_RADIUS_MILES = 3959;
const haversineDistance = `
  ${EARTH_RADIUS_MILES} * 2 * ASIN(
    SQRT(
      POWER(SIN(($3 - latitude) * pi()/180 / 2), 2) +
      COS($3 * pi()/180) *
      COS(latitude * pi()/180) *
      POWER(SIN(($4 - longitude) * pi()/180 / 2), 2)
    )
  ) as distance
`;

export async function getPopularServices(): Promise<{ service: string; count: number }[]> {
  try {
    if (isBuildTime) {
      return [];
    }

    const { data, error } = await supabase
      .from('magician_availability')
      .select('availability');

    if (error) throw error;
    if (!data) return [];

    // Count occurrences of each service
    const serviceCounts: { [key: string]: number } = {};
    data.forEach(({ availability }: { availability: string }) => {
      if (!serviceCounts[availability]) {
        serviceCounts[availability] = 0;
      }
      serviceCounts[availability]++;
    });

    // Convert to array and sort by count
    return Object.entries(serviceCounts)
      .map(([service, count]: [string, number]) => ({ service, count }))
      .sort((a: { count: number }, b: { count: number }) => b.count - a.count);
  } catch (error: unknown) {
    console.error('Error fetching popular services:', error);
    return [];
  }
}

export const getLocations = async (): Promise<{ state: string; city: string; magicianCount: number }[]> => {
  try {
    if (isBuildTime) {
      return [];
    }

    // First, get all primary locations
    const { data, error } = await supabase
      .from('magician_locations')
      .select('state, city, magician_id')
      .eq('is_primary', true);

    if (error) throw error;
    if (!data) return [];

    // Then count magicians per location in memory
    const locationCounts: Record<string, Location> = data.reduce<Record<string, Location>>((acc: Record<string, Location>, curr: { city: string; state: string }) => {
      const key = `${curr.city}, ${curr.state}`;
      if (!acc[key]) {
        acc[key] = {
          state: curr.state,
          city: curr.city,
          count: 0
        };
      }
      acc[key].count++;
      return acc;
    }, {});

    // Convert to array and sort
    return Object.values(locationCounts)
      .map(location => ({
        state: location.state,
        city: location.city,
        magicianCount: location.count
      }))
      .sort((a, b) => b.magicianCount - a.magicianCount);
  } catch (error: unknown) {
    console.error('Error fetching locations:', error);
    return [];
  }
}

export async function getFilterData(): Promise<FilterData> {
  try {
    const [locations, services] = await Promise.all([
      getLocations(),
      getPopularServices()
    ]);

    return {
      locations,
      services
    };
  } catch (error: unknown) {
    console.error('Error fetching filter data:', error);
    return {
      locations: [],
      services: []
    };
  }
}

export async function getMagicianBySlug(slug: string): Promise<Magician | null> {
  try {
    const { data, error } = await supabase
      .from('magicians')
      .select(`
        *,
        magicianLocations:magician_locations(*),
        magicianAvailability:magician_availability(*)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching magician by slug:', error);
      return null;
    }

    if (!data) return null;

    return formatMagician(data);
  } catch (error) {
    console.error('Error in getMagicianBySlug:', error);
    return null;
  }
}

export async function getLocationBySlug(slug: string): Promise<Location | null> {
  try {
    const { data, error } = await supabase
      .from('magician_locations')
      .select('city, state, slug, count:id')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching location by slug:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getLocationBySlug:', error);
    return null;
  }
}

// Enhanced search function that supports both legacy and new search patterns
export async function searchMagicians(params: SearchParams | MagicianSearchParams): Promise<SearchResults> {
  console.log('Search Parameters:', params);

  try {
    let query = supabase
      .from('magicians')
      .select('*', { count: 'exact' });

    // Name search
    if ('query' in params && params.query) {
      query = query.ilike('name', `%${params.query}%`);
      console.log('Applying name search:', params.query);
    }

    // Location filtering
    if ('city' in params && params.city) {
      query = query.eq('city', params.city);
      console.log('Applying city filter:', params.city);
    }
    if ('state' in params && params.state) {
      query = query.eq('state', params.state);
      console.log('Applying state filter:', params.state);
    }

    // Type filtering
    if ('service' in params && params.service) {
      query = query.contains('types', [params.service]);
      console.log('Applying type filter:', params.service);
    }

    // Pagination
    const page = ('page' in params ? params.page : 1) || 1;
    const pageSize = ('pageSize' in params ? params.pageSize : 'limit' in params ? params.limit : 10) || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to);
    console.log('Applying pagination:', { page, pageSize, from, to });

    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Search Error:', error);
      throw error;
    }

    return {
      magicians: data || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((count || 0) / pageSize),
        totalResults: count || 0,
        pageSize
      }
    };

  } catch (error) {
    console.error('Search Error:', error);
    throw error;
  }
}

// Legacy support function for backward compatibility
export async function searchMagiciansByLocation(city: string, state: string): Promise<SearchResults> {
  return searchMagicians({ city, state });
}

// Legacy support function for service-based search
export async function searchMagiciansByService(service: string): Promise<SearchResults> {
  return searchMagicians({ service });
}

export async function getMagicianById(id: string): Promise<Magician | null> {
  try {
    if (isBuildTime) {
      return null;
    }

    const { data: magician, error } = await supabase
      .from('magicians')
      .select(`
        *,
        magicianLocations:magician_locations!inner (
          city,
          state,
          latitude,
          longitude
        ),
        magicianAvailability:magician_availability (
          availability
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!magician) return null;

    return formatMagician(magician as MagicianWithRelations);
  } catch (error: unknown) {
    console.error('Error fetching magician:', error);
    return null;
  }
}
