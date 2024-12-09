import type { Magician } from './magician';

export interface SearchParams {
  query?: string;
  state?: string;
  city?: string;
  service?: string;
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
  locations: Array<{ state: string; city: string; magicianCount: number }>;
  services: Array<{ service: string; count: number }>;
}
