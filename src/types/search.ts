import type { Magician } from './magician';

// Legacy search parameters
export interface SearchParams {
  query?: string;
  state?: string;
  city?: string;
  service?: string;
  services?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  pageSize?: number;
}

// New search parameters with slug support
export interface SlugSearchParams {
  slug?: string;
  service?: string;
  services?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

// Combined search results interface
export interface SearchResults {
  magicians: Magician[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter data interface
export interface FilterData {
  services: string[];
  locations: {
    city: string;
    state: string;
    slug: string;
    magicianCount: number;
  }[];
}

// Sort options
export type SortOption = 'distance' | 'rating' | 'review_count';
export type SortOrder = 'asc' | 'desc';

// Search metadata for logging and debugging
export interface SearchMetadata {
  duration: number;
  timestamp: string;
  params: SearchParams | SlugSearchParams;
  filtered?: number;
  total?: number;
}
