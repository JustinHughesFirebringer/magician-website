import { createClient } from '@supabase/supabase-js';
import type { Magician } from '@/types/magician';
import type { SearchResults, FilterData, SearchParams } from '@/types/search';

const isDevelopment = process.env.NODE_ENV === 'development';
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

// Initialize Supabase client
const supabaseUrl = "https://siukegkcregepkwqiora.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdWtlZ2tjcmVnZXBrd3Fpb3JhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzYwOTgyNiwiZXhwIjoyMDQ5MTg1ODI2fQ.tV0smu1gE9gvIS2lmttRkuRd26dlyEGYIZoBo7L5Cx0";
const supabase = createClient(supabaseUrl, supabaseKey);

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

// Helper function to format magician data
function formatMagician(data: any): Magician {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    websiteUrl: data.website_url,
    rating: data.rating,
    reviewCount: data.review_count,
    verified: data.verified || false,
    location: {
      city: data.magician_locations[0].city,
      state: data.magician_locations[0].state,
      coordinates: {
        latitude: data.magician_locations[0].latitude,
        longitude: data.magician_locations[0].longitude
      }
    },
    specialties: data.magician_specialties.map((s: any) => s.specialty),
    availability: data.magician_availability[0]?.availability || 'By Appointment',
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}

// Helper function to calculate Haversine distance
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export async function getPopularServices(): Promise<{ service: string; count: number }[]> {
  try {
    if (isBuildTime) {
      return [];
    }

    // First, get all specialties
    const { data, error } = await supabase
      .from('magician_specialties')
      .select('specialty');

    if (error) throw error;
    if (!data) return [];

    // Then count them in memory
    const counts = data.reduce((acc: { [key: string]: number }, curr) => {
      acc[curr.specialty] = (acc[curr.specialty] || 0) + 1;
      return acc;
    }, {});

    // Convert to array and sort
    const services = Object.entries(counts)
      .map(([specialty, count]) => ({
        service: specialty,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return services;
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
    const locationCounts = data.reduce((acc: { [key: string]: { state: string; city: string; count: number } }, curr) => {
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
      .map(loc => ({
        state: loc.state,
        city: loc.city,
        magicianCount: loc.count
      }))
      .sort((a, b) => b.magicianCount - a.magicianCount);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}

export async function getFilterData(): Promise<FilterData> {
  try {
    if (isBuildTime) {
      return {
        services: [],
        locations: []
      };
    }

    const [services, locations] = await Promise.all([
      getPopularServices(),
      getLocations()
    ]);

    return {
      services,
      locations
    };
  } catch (error) {
    console.error('Error fetching filter data:', error);
    return {
      services: [],
      locations: []
    };
  }
}

export async function searchMagicians(params: SearchParams): Promise<SearchResults> {
  try {
    if (isBuildTime) {
      return {
        magicians: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0
      };
    }

    const {
      service,
      location,
      latitude,
      longitude,
      radius = 50,
      page = 1,
      pageSize = 12
    } = params;

    let query = supabase
      .from('magicians')
      .select(`
        *,
        magician_locations!inner (
          city,
          state,
          latitude,
          longitude
        ),
        magician_specialties (
          specialty
        ),
        magician_availability (
          availability
        )
      `, { count: 'exact' });

    // Apply filters
    if (service) {
      query = query.contains('magician_specialties.specialty', [service]);
    }

    if (location) {
      const [city, state] = location.split(', ');
      query = query
        .eq('magician_locations.city', city)
        .eq('magician_locations.state', state);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    query = query
      .range(from, to)
      .order('created_at', { ascending: false });

    const { data: magicians, error, count } = await query;

    if (error) throw error;

    // Filter by distance if coordinates are provided
    let filteredMagicians = magicians || [];
    if (latitude && longitude && radius) {
      filteredMagicians = magicians!.filter(magician => {
        const location = magician.magician_locations[0];
        const distance = calculateHaversineDistance(
          latitude,
          longitude,
          location.latitude,
          location.longitude
        );
        return distance <= radius;
      });
    }

    // Format magicians
    const formattedMagicians = filteredMagicians.map(formatMagician);
    const totalCount = count || 0;

    return {
      magicians: formattedMagicians,
      total: totalCount,
      page,
      limit: pageSize,
      totalPages: Math.ceil(totalCount / pageSize)
    };
  } catch (error) {
    console.error('Error searching magicians:', error);
    return {
      magicians: [],
      total: 0,
      page: 1,
      limit: 12,
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
        magician_locations!inner (
          city,
          state,
          latitude,
          longitude
        ),
        magician_specialties (
          specialty
        ),
        magician_availability (
          availability
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!magician) return null;

    return formatMagician(magician);
  } catch (error) {
    console.error('Error fetching magician:', error);
    return null;
  }
}
