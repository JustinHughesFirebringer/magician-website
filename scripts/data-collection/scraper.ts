import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFile } from 'fs/promises';
import path from 'path';

interface RawMagicianData {
  name: string;
  website?: string;
  location: {
    city: string;
    state: string;
  };
  source: string;
  sourceUrl: string;
}

async function scrapeMagiciansDirectory(): Promise<RawMagicianData[]> {
  const magicians: RawMagicianData[] = [];
  
  // Sources to scrape (these are examples, we'll implement each specifically)
  const sources = [
    'https://www.magician.org/member-directory',
    'https://www.gigsalad.com/Society-Magicians',
    'https://www.thumbtack.com/k/magicians',
    // Add more sources
  ];

  // Implement scraping logic for each source
  // This is a placeholder for the actual implementation
  for (const source of sources) {
    try {
      const response = await axios.get(source);
      const $ = cheerio.load(response.data);
      
      // Specific scraping logic will go here based on each site's structure
      // This is just an example structure
      $('.magician-listing').each((_, element) => {
        const name = $(element).find('.name').text().trim();
        const city = $(element).find('.city').text().trim();
        const state = $(element).find('.state').text().trim();
        
        if (name && city && state) {
          magicians.push({
            name,
            location: { city, state },
            source: 'Directory Name',
            sourceUrl: source
          });
        }
      });
    } catch (error) {
      console.error(`Error scraping ${source}:`, error);
    }
  }

  return magicians;
}

async function getGeocodeData(location: string): Promise<{lat: number; lng: number} | null> {
  try {
    // We'll use OpenStreetMap's Nominatim service (free, no API key required)
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
    );
    
    if (response.data && response.data[0]) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error(`Error geocoding ${location}:`, error);
    return null;
  }
}

async function main() {
  try {
    // 1. Scrape magician data
    const rawData = await scrapeMagiciansDirectory();
    
    // 2. Add geocoding data
    const enrichedData = await Promise.all(
      rawData.map(async (magician) => {
        const location = `${magician.location.city}, ${magician.location.state}, USA`;
        const coordinates = await getGeocodeData(location);
        
        return {
          ...magician,
          coordinates,
          // Add placeholder data that we'll enrich later
          specialty: ['Magic Shows'],
          priceRange: '$250-$1000',
          rating: 0,
          reviewCount: 0
        };
      })
    );

    // 3. Save the data
    const outputPath = path.join(__dirname, '../../src/data/collected-magicians.json');
    await writeFile(outputPath, JSON.stringify(enrichedData, null, 2));
    
    console.log(`Successfully collected data for ${enrichedData.length} magicians`);
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

// Add rate limiting and respect robots.txt
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main();
