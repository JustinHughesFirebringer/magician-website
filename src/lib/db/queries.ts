import { supabase } from '../../lib/supabase';
import { Magician } from '../../types/magician';
import { SearchParams, SearchResults, FilterData } from '../../types/search';
import { Database } from '../../types/database';
import { calculateHaversineDistance } from '../utils';

const isDevelopment = process.env.NODE_ENV === 'development';
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

interface MagicianWithRelations extends Omit<Database['public']['Tables']['magicians']['Row'], 'bio'> {
  magicianLocations: Database['public']['Tables']['magician_locations']['Row'][];
  magicianAvailability: Database['public']['Tables']['magician_availability']['Row'][];
  bio?: string | null;  // This will be used as description
}

interface Location {
  state: string;
  city: string;
  count: number;
}

// Helper function to format magician data
export function formatMagician(data: MagicianWithRelations): Magician {
  return {
    id: data.id,
    name: data.name,
    business_name: data.business_name,
    email: data.email,
    phone: data.phone,
    website_url: data.website_url,
    description: data.bio || null,  // Map bio to description
    price_range_min: null,  // These fields don't exist in DB yet
    price_range_max: null,
    rating: null,
    review_count: null,
    verified: false,  // Default to false since we don't have this field yet
    locations: data.magicianLocations.map(loc => ({
      id: loc.id,
      ...(loc.address && { address_line1: loc.address }),
      city: loc.city,
      state: loc.state,
      postal_code: loc.postal_code || null,  // Added postal_code
      latitude: loc.latitude,  // Now required
      longitude: loc.longitude,  // Now required
      service_radius_miles: null,  // This field doesn't exist in DB yet
      is_primary: true  // Default to true since we don't have this field yet
    })),
    availability: data.magicianAvailability.map(a => a.availability),
    created_at: data.created_at,
    updated_at: data.updated_at,
    image_url: data.avatar_url || null  // Use avatar_url from database
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
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error fetching popular services:', error);
    return [];
  }
}

export async function getLocations(): Promise<{ state: string; city: string; magicianCount: number }[]> {
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
    const locationCounts = data.reduce((acc: Record<string, Location>, curr) => {
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
  } catch (error) {
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
  } catch (error) {
    console.error('Error fetching filter data:', error);
    return {
      locations: [],
      services: []
    };
  }
}

export async function searchMagicians(params: SearchParams): Promise<SearchResults> {
  try {
    const {
      query,
      state,
      city,
      service,
      latitude,
      longitude,
      radius = 50,
      page = 1,
      pageSize = 10
    } = params;

    let query_builder = supabase
      .from('magicians')
      .select(`
        *,
        magicianLocations:magician_locations (*),
        magicianAvailability:magician_availability (*)
      `);

    // Apply filters
    if (query) {
      query_builder = query_builder.ilike('name', `%${query}%`);
    }

    if (state) {
      query_builder = query_builder.eq('magicianLocations.state', state);
    }

    if (city) {
      query_builder = query_builder.eq('magicianLocations.city', city);
    }

    if (service) {
      query_builder = query_builder.contains('services', [service]);
    }

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Execute query with pagination
    const { data, error, count } = await query_builder
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return { magicians: [], total: 0, page, limit: pageSize, totalPages: 0 };

    // Format magicians and calculate distances if coordinates provided
    const formattedMagicians = data.map((magician: MagicianWithRelations) => {
      const formatted = formatMagician(magician);
      if (latitude && longitude) {
        const magicianLocation = magician.magicianLocations?.[0];
        if (magicianLocation?.latitude && magicianLocation?.longitude) {
          const distance = calculateHaversineDistance(
            latitude,
            longitude,
            magicianLocation.latitude,
            magicianLocation.longitude
          );
          return { ...formatted, distance: distance as number };
        }
      }
      return formatted;
    });

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      magicians: formattedMagicians,
      total,
      page,
      limit: pageSize,
      totalPages
    };

  } catch (error) {
    console.error('Error searching magicians:', error);
    return {
      magicians: [],
      total: 0,
      page: params.page || 1,
      limit: params.pageSize || 10,
      totalPages: 0
    };
  }
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
      .single<MagicianWithRelations>();

    if (error) throw error;
    if (!magician) return null;

    return formatMagician(magician);
  } catch (error) {
    console.error('Error fetching magician:', error);
    return null;
  }
}
