export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
}

export interface Magician {
  id: string;
  name: string;
  business_name?: string;
  city?: string;
  state?: string;
  services?: string[];
  rating?: number;
  review_count?: number;
  imageUrl?: string;
  description?: string;
  website_url?: string;
  phone?: string;
  email?: string;
  socialMedia?: SocialMedia;
  created_at?: string;
  updated_at?: string;
  price_range_min?: number;
  price_range_max?: number;
  verified?: boolean;
}
