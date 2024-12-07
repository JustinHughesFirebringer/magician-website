import type { Magician } from './magician';

export interface SearchParams {
  query?: string;
  service?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  pageSize?: number;
}

export interface SearchResults {
  magicians: Magician[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterData {
  services: Array<{ service: string; count: number }>;
  locations: Array<{ state: string; city: string; magicianCount: number }>;
}
