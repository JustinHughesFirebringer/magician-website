export interface Location {
  city: string;
  state: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Magician {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  rating?: number;
  reviewCount?: number;
  verified: boolean;
  location: Location;
  specialties: string[];
  availability: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MagicianWithDistance extends Magician {
  distance?: number;
}
