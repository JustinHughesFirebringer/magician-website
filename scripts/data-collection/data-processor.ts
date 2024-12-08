import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';
import { setTimeout } from 'timers/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface RawListing {
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

interface ProcessedListing {
  name: string;
  businessName: string;
  location: {
    city: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    website?: string;
    phone?: string;
    email?: string;
  };
  services: string[];
  description: string;
  sources: {
    name: string;
    url: string;
  }[];
}

class DataProcessor {
  private readonly stateAbbreviations: { [key: string]: string } = {
    'Alabama': 'AL',
    'Alaska': 'AK',
    // ... add all state mappings
  };

  async loadRawData(filename: string): Promise<RawListing[]> {
    const filePath = join(__dirname, '../../data', filename);
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  }

  private async geocodeLocation(city: string, state: string): Promise<{ lat: number; lng: number } | null> {
    try {
      // Using OpenStreetMap's Nominatim service (free, no API key required)
      const query = encodeURIComponent(`${city}, ${state}, USA`);
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'MagicianDirectory/1.0'
          }
        }
      );

      if (response.data && response.data[0]) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error(`Error geocoding ${city}, ${state}:`, error);
      return null;
    }
  }

  private normalizeState(state: string): string {
    // Convert full state names to abbreviations
    const upperState = state.toUpperCase();
    return this.stateAbbreviations[upperState] || upperState;
  }

  private normalizePhone(phone: string): string | undefined {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid US phone number
    if (cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'))) {
      const number = cleaned.slice(-10);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    
    return undefined;
  }

  private categorizeServices(services: string[]): string[] {
    const serviceCategories = new Set<string>();
    
    const categoryKeywords: { [key: string]: string[] } = {
      'Close-up Magic': ['close-up', 'close up', 'tableside', 'walk-around', 'strolling'],
      'Stage Magic': ['stage', 'platform', 'theater', 'theatre', 'illusion show'],
      'Children\'s Magic': ['children', 'kids', 'birthday', 'party'],
      'Mentalism': ['mentalism', 'mind reading', 'psychic', 'mental'],
      'Corporate Magic': ['corporate', 'trade show', 'business', 'company'],
      'Wedding Entertainment': ['wedding', 'reception', 'bridal'],
    };

    // Categorize based on service descriptions and keywords
    for (const service of services) {
      const lowerService = service.toLowerCase();
      
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => lowerService.includes(keyword))) {
          serviceCategories.add(category);
        }
      }
    }

    return Array.from(serviceCategories);
  }

  async processListings(rawListings: RawListing[]): Promise<ProcessedListing[]> {
    const processedListings: ProcessedListing[] = [];
    const seen = new Set<string>(); // Track duplicates by name and location

    for (const raw of rawListings) {
      try {
        // Create unique identifier for deduplication
        const identifier = `${raw.name.toLowerCase()}-${raw.location.city.toLowerCase()}-${raw.location.state.toLowerCase()}`;
        
        // Check for duplicate
        if (seen.has(identifier)) {
          // Merge with existing listing
          const existingIndex = processedListings.findIndex(p => 
            `${p.name.toLowerCase()}-${p.location.city.toLowerCase()}-${p.location.state.toLowerCase()}` === identifier
          );
          
          if (existingIndex !== -1) {
            const existing = processedListings[existingIndex];
            existing.sources.push({
              name: raw.source,
              url: raw.sourceUrl
            });
            
            // Merge other fields if they exist in the new listing
            if (raw.services) {
              existing.services = [...new Set([...existing.services, ...this.categorizeServices(raw.services)])];
            }
            if (raw.description && raw.description.length > existing.description.length) {
              existing.description = raw.description;
            }
            if (raw.website) {
              existing.contact.website = raw.website;
            }
            if (raw.phone) {
              existing.contact.phone = this.normalizePhone(raw.phone);
            }
            if (raw.email) {
              existing.contact.email = raw.email;
            }
          }
          continue;
        }

        // Add to seen set
        seen.add(identifier);

        // Geocode location
        const coordinates = await this.geocodeLocation(raw.location.city, raw.location.state);
        await setTimeout(1000); // Rate limiting for geocoding service

        // Create processed listing
        const processed: ProcessedListing = {
          name: raw.name,
          businessName: raw.businessName || raw.name,
          location: {
            city: raw.location.city,
            state: this.normalizeState(raw.location.state),
            coordinates: coordinates || undefined
          },
          contact: {
            website: raw.website,
            phone: raw.phone ? this.normalizePhone(raw.phone) : undefined,
            email: raw.email
          },
          services: raw.services ? this.categorizeServices(raw.services) : [],
          description: raw.description || '',
          sources: [{
            name: raw.source,
            url: raw.sourceUrl
          }]
        };

        processedListings.push(processed);
      } catch (error) {
        console.error(`Error processing listing for ${raw.name}:`, error);
      }
    }

    return processedListings;
  }

  async saveProcessedData(data: ProcessedListing[], filename: string) {
    const outputPath = join(__dirname, '../../data', filename);
    await writeFile(outputPath, JSON.stringify(data, null, 2));
    console.log(`Saved ${data.length} processed listings to ${outputPath}`);
  }
}

async function main() {
  const processor = new DataProcessor();
  
  try {
    // Load raw data
    const rawData = await processor.loadRawData('magician-listings.json');
    console.log(`Loaded ${rawData.length} raw listings`);

    // Process the data
    const processedData = await processor.processListings(rawData);
    console.log(`Processed ${processedData.length} listings`);

    // Save processed data
    await processor.saveProcessedData(processedData, 'processed-magicians.json');
  } catch (error) {
    console.error('Error in main processing:', error);
  }
}

main();
