export interface MagicianListing {
  name: string;
  businessName?: string;
  location: {
    city: string;
    state: string;
  };
  website?: string;
  phone?: string;
  email?: string;
  source: string;
  sourceUrl: string;
  listingUrl?: string;
  description?: string;
  services?: string[];
}
