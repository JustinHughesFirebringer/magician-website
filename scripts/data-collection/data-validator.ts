import { z } from 'zod';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import { validate as validateEmail } from 'email-validator';
import { states } from './constants';

// Define the schema for magician listings using Zod
const MagicianListingSchema = z.object({
  name: z.string().min(2).max(100),
  businessName: z.string().min(2).max(100).optional(),
  location: z.object({
    city: z.string().min(2).max(100),
    state: z.string().length(2).refine(state => states.includes(state), {
      message: 'Invalid US state code'
    })
  }),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  source: z.string(),
  sourceUrl: z.string(),
  listingUrl: z.string().url().optional(),
  description: z.string().optional(),
  services: z.array(z.string()).optional(),
  socialMedia: z.object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    youtube: z.string().url().optional(),
    twitter: z.string().url().optional()
  }).optional(),
  verified: z.boolean().default(false),
  lastVerified: z.date().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional()
});

export type MagicianListing = z.infer<typeof MagicianListingSchema>;

export class DataValidator {
  private static readonly COMMON_SERVICES = [
    'Close-up Magic',
    'Stage Shows',
    'Corporate Events',
    'Wedding Entertainment',
    'Birthday Parties',
    'Mentalism',
    'Illusions',
    'Street Magic',
    'Virtual Shows',
    'Children\'s Entertainment'
  ];

  /**
   * Validates a magician listing against the schema
   */
  static validateListing(listing: any): { isValid: boolean; errors: string[] } {
    try {
      MagicianListingSchema.parse(listing);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return { isValid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Normalizes and enriches a magician listing
   */
  static async enrichListing(listing: MagicianListing): Promise<MagicianListing> {
    const enriched = { ...listing };

    // Normalize phone number
    if (enriched.phone) {
      try {
        if (isValidPhoneNumber(enriched.phone, 'US')) {
          const phoneNumber = parsePhoneNumber(enriched.phone, 'US');
          enriched.phone = phoneNumber.formatNational();
        } else {
          delete enriched.phone;
        }
      } catch {
        delete enriched.phone;
      }
    }

    // Validate and normalize email
    if (enriched.email && !validateEmail(enriched.email)) {
      delete enriched.email;
    }

    // Normalize state code
    enriched.location.state = enriched.location.state.toUpperCase();

    // Normalize city name
    enriched.location.city = this.normalizeCityName(enriched.location.city);

    // Normalize and categorize services
    if (enriched.services) {
      enriched.services = this.normalizeServices(enriched.services);
    }

    // Clean and normalize description
    if (enriched.description) {
      enriched.description = this.normalizeDescription(enriched.description);
    }

    // Normalize website URL
    if (enriched.website) {
      enriched.website = this.normalizeUrl(enriched.website);
    }

    return enriched;
  }

  /**
   * Normalizes city name (capitalizes first letter of each word)
   */
  private static normalizeCityName(city: string): string {
    return city
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }

  /**
   * Normalizes services by matching against common services and removing duplicates
   */
  private static normalizeServices(services: string[]): string[] {
    const normalizedServices = new Set<string>();
    
    services.forEach(service => {
      const normalizedService = service.trim();
      
      // Try to match with common services
      const matchedService = this.COMMON_SERVICES.find(
        commonService => commonService.toLowerCase() === normalizedService.toLowerCase()
      );

      if (matchedService) {
        normalizedServices.add(matchedService);
      } else {
        // If no match found, add the capitalized version
        normalizedServices.add(
          normalizedService.charAt(0).toUpperCase() + normalizedService.slice(1)
        );
      }
    });

    return Array.from(normalizedServices);
  }

  /**
   * Normalizes description by removing extra whitespace and limiting length
   */
  private static normalizeDescription(description: string): string {
    const MAX_DESCRIPTION_LENGTH = 1000;
    return description
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_DESCRIPTION_LENGTH);
  }

  /**
   * Normalizes URL by ensuring it starts with https:// and removing trailing slashes
   */
  private static normalizeUrl(url: string): string {
    let normalizedUrl = url.trim();
    
    // Add https:// if no protocol is specified
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    
    // Convert http to https
    normalizedUrl = normalizedUrl.replace(/^http:\/\//i, 'https://');
    
    // Remove trailing slash
    normalizedUrl = normalizedUrl.replace(/\/$/, '');
    
    return normalizedUrl;
  }
}
