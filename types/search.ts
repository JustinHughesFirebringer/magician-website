import { Magician } from './magician';

export interface SearchResults {
  magicians: Magician[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export interface FilterData {
  services: { service: string; count: number }[];
  locations: { state: string; city: string; magician_count: number }[];
}
