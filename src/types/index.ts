export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface FilterOptions {
  services: string[];
  locations: Location[];
  priceRanges: string[];
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: number;
}

export interface SearchParams extends PaginationParams {
  service?: string;
  location?: string;
  priceRange?: string;
  sortBy?: 'rating' | 'price' | 'distance';
}

// Re-export existing types
export * from './magician';
export * from './search';

