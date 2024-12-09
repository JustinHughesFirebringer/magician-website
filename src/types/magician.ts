export interface Location {
  id: string;
  address_line1?: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  service_radius_miles: number | null;
  is_primary: boolean;
}

export interface Magician {
  id: string;
  name: string;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website_url?: string | null;
  description?: string | null;
  price_range_min?: number | null;
  price_range_max?: number | null;
  rating?: number | null;
  review_count?: number | null;
  verified: boolean | null;
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
