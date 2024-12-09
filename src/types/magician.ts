export interface Location {
  id: string;
  address_line1?: string;
  city: string;
  state: string;
  postal_code?: string | null;
  latitude: number;
  longitude: number;
  service_radius_miles: number | null;
  is_primary: boolean;
  slug: string;
  magician_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Magician {
  id: string;
  name: string;
  slug: string;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website_url?: string | null;
  description?: string | null;
  price_range_min?: number | null;
  price_range_max?: number | null;
  rating?: number | null;
  review_count?: number | null;
  verified: boolean;
  locations: Location[];
  availability: string[];
  created_at: string;
  updated_at: string;
  image_url?: string | null;
  social_media?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  } | null;
}

export interface MagicianWithDistance extends Magician {
  distance?: number;
}

export interface MagicianResponse {
  data: Magician[] | null;
  error: Error | null;
  count?: number;
}

export interface LocationResponse {
  data: Location[] | null;
  error: Error | null;
  count?: number;
}

export interface MagicianSearchParams {
  city?: string;
  state?: string;
  slug?: string;
  service?: string;
  radius?: number;
  latitude?: number;
  longitude?: number;
  page?: number;
  limit?: number;
  sortBy?: 'distance' | 'rating' | 'review_count';
  order?: 'asc' | 'desc';
}
