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
  businessName: string;
  city: string;
  state: string;
  services: string[];
  rating: number;
  reviewCount: number;
  imageUrl: string;
  description: string;
  website?: string;
  phone?: string;
  email?: string;
  socialMedia?: SocialMedia;
  createdAt: Date;
  updatedAt: Date;
}
