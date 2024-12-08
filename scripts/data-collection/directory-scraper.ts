import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as puppeteer from 'puppeteer';
import { setTimeout } from 'timers/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MagicianListing {
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
  priceRange?: {
    min?: number;
    max?: number;
  };
}

// Major cities in each state
const citiesByState: { [key: string]: string[] } = {
  'AL': ['Birmingham', 'Montgomery', 'Huntsville', 'Mobile'],
  'AK': ['Anchorage', 'Fairbanks', 'Juneau'],
  'AZ': ['Phoenix', 'Tucson', 'Mesa', 'Scottsdale'],
  'AR': ['Little Rock', 'Fort Smith', 'Fayetteville'],
  'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
  'CO': ['Denver', 'Colorado Springs', 'Boulder'],
  'CT': ['Hartford', 'New Haven', 'Stamford'],
  'DE': ['Wilmington', 'Dover', 'Newark'],
  'FL': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
  'GA': ['Atlanta', 'Savannah', 'Augusta'],
  'HI': ['Honolulu', 'Hilo', 'Kailua'],
  'ID': ['Boise', 'Nampa', 'Meridian'],
  'IL': ['Chicago', 'Springfield', 'Peoria'],
  'IN': ['Indianapolis', 'Fort Wayne', 'South Bend'],
  'IA': ['Des Moines', 'Cedar Rapids', 'Davenport'],
  'KS': ['Wichita', 'Kansas City', 'Topeka'],
  'KY': ['Louisville', 'Lexington', 'Bowling Green'],
  'LA': ['New Orleans', 'Baton Rouge', 'Shreveport'],
  'ME': ['Portland', 'Augusta', 'Bangor'],
  'MD': ['Baltimore', 'Annapolis', 'Frederick'],
  'MA': ['Boston', 'Worcester', 'Springfield'],
  'MI': ['Detroit', 'Grand Rapids', 'Ann Arbor'],
  'MN': ['Minneapolis', 'St. Paul', 'Rochester'],
  'MS': ['Jackson', 'Gulfport', 'Biloxi'],
  'MO': ['Kansas City', 'St. Louis', 'Springfield'],
  'MT': ['Billings', 'Missoula', 'Great Falls'],
  'NE': ['Omaha', 'Lincoln', 'Bellevue'],
  'NV': ['Las Vegas', 'Reno', 'Henderson'],
  'NH': ['Manchester', 'Nashua', 'Concord'],
  'NJ': ['Newark', 'Jersey City', 'Atlantic City'],
  'NM': ['Albuquerque', 'Santa Fe', 'Las Cruces'],
  'NY': ['New York', 'Buffalo', 'Albany'],
  'NC': ['Charlotte', 'Raleigh', 'Durham'],
  'ND': ['Fargo', 'Bismarck', 'Grand Forks'],
  'OH': ['Columbus', 'Cleveland', 'Cincinnati'],
  'OK': ['Oklahoma City', 'Tulsa', 'Norman'],
  'OR': ['Portland', 'Salem', 'Eugene'],
  'PA': ['Philadelphia', 'Pittsburgh', 'Harrisburg'],
  'RI': ['Providence', 'Warwick', 'Newport'],
  'SC': ['Charleston', 'Columbia', 'Myrtle Beach'],
  'SD': ['Sioux Falls', 'Rapid City', 'Aberdeen'],
  'TN': ['Nashville', 'Memphis', 'Knoxville'],
  'TX': ['Houston', 'Dallas', 'Austin', 'San Antonio'],
  'UT': ['Salt Lake City', 'Provo', 'Park City'],
  'VT': ['Burlington', 'Montpelier', 'Rutland'],
  'VA': ['Richmond', 'Virginia Beach', 'Arlington'],
  'WA': ['Seattle', 'Spokane', 'Tacoma'],
  'WV': ['Charleston', 'Huntington', 'Morgantown'],
  'WI': ['Milwaukee', 'Madison', 'Green Bay'],
  'WY': ['Cheyenne', 'Casper', 'Jackson']
};

class DirectoryScraper {
  private results: MagicianListing[] = [];
  private readonly delay: number = 2000; // 2 seconds between requests
  private browser: puppeteer.Browser | null = null;

  private async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true
      });
    }
    return this.browser;
  }

  private async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeGigSalad() {
    const states = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    const browser = await this.initBrowser();
    const page = await browser.newPage();

    // First get a session cookie
    await page.goto('https://www.gigsalad.com', { waitUntil: 'networkidle0' });

    for (const state of states) {
      try {
        // Use their internal search API
        const response = await axios.get(`https://www.gigsalad.com/api/search/performers`, {
          params: {
            query: 'magician',
            location: state,
            category: 'magician',
            page: 1,
            per_page: 100
          },
          headers: {
            'Accept': 'application/json',
            'Cookie': await page.evaluate(() => document.cookie)
          }
        });

        if (response.data && response.data.performers) {
          for (const performer of response.data.performers) {
            this.results.push({
              name: performer.name,
              businessName: performer.business_name,
              location: {
                city: performer.city,
                state: performer.state
              },
              description: performer.description,
              source: 'GigSalad',
              sourceUrl: `https://www.gigsalad.com/search?q=magician&location=${state}`,
              listingUrl: `https://www.gigsalad.com${performer.profile_url}`,
              priceRange: performer.starting_price ? {
                min: parseInt(performer.starting_price)
              } : undefined
            });
          }
        }

        console.log(`Processed state ${state} on GigSalad, found ${this.results.length} magicians so far`);
        await setTimeout(this.delay);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error processing state ${state} on GigSalad:`, error);
        }
      }
    }

    await page.close();
  }

  async scrapeTheBash() {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    // Set a longer timeout for navigation
    page.setDefaultNavigationTimeout(30000);

    // Process each state and its major cities
    for (const [state, cities] of Object.entries(citiesByState)) {
      for (const city of cities) {
        try {
          // Format city name for URL (replace spaces with single hyphen, lowercase)
          const formattedCity = city.toLowerCase().replace(/ /g, '-');
          // Add state abbreviation and remove distance filter
          const url = `https://www.thebash.com/search/magician-${formattedCity}-${state.toLowerCase()}?distance=0`;
          
          console.log(`Scraping ${url}`);
          await page.goto(url, { waitUntil: 'networkidle0' });

          // Wait for vendor cards to load
          await page.waitForSelector('.vendor-card', { timeout: 5000 });

          const vendors = await page.evaluate(() => {
            const results: any[] = [];
            document.querySelectorAll('.vendor-card').forEach((element) => {
              const nameEl = element.querySelector('.vendor-card__title');
              const locationEl = element.querySelector('.vendor-card__location');
              const descriptionEl = element.querySelector('.vendor-card__description');
              const linkEl = element.querySelector('a.vendor-card__link') as HTMLAnchorElement;
              const priceEl = element.querySelector('.vendor-card__price');

              if (nameEl && locationEl) {
                const name = nameEl.textContent?.trim() || '';
                const location = locationEl.textContent?.trim() || '';
                const [city, state] = location.split(', ');
                const description = descriptionEl?.textContent?.trim() || '';
                const listingUrl = linkEl?.href;
                const priceText = priceEl?.textContent?.trim() || '';
                const priceMatch = priceText.match(/Starting at \$(\d+)/);

                if (name && city && state) {
                  results.push({
                    name,
                    location: {
                      city,
                      state
                    },
                    description,
                    source: 'The Bash',
                    sourceUrl: window.location.href,
                    listingUrl,
                    priceRange: priceMatch ? {
                      min: parseInt(priceMatch[1])
                    } : undefined
                  });
                }
              }
            });
            return results;
          });

          // Add unique vendors (avoid duplicates from nearby cities)
          for (const vendor of vendors) {
            const isDuplicate = this.results.some(
              existing => 
                existing.name === vendor.name && 
                existing.location.city === vendor.location.city && 
                existing.location.state === vendor.location.state
            );

            if (!isDuplicate) {
              this.results.push(vendor);
            }
          }

          console.log(`Found ${vendors.length} magicians in ${city}, ${state}. Total unique magicians: ${this.results.length}`);
          await setTimeout(this.delay);
        } catch (error) {
          if (error instanceof Error) {
            if (error.name === 'TimeoutError') {
              console.log(`No results for ${city}, ${state} on The Bash`);
            } else {
              console.error(`Error processing ${city}, ${state} on The Bash:`, error);
            }
          }
        }
      }
    }

    await page.close();
  }

  async saveResults() {
    try {
      const outputPath = join(__dirname, '../../data/raw-listings.json');
      await writeFile(outputPath, JSON.stringify(this.results, null, 2));
      console.log(`Successfully saved ${this.results.length} magician listings to ${outputPath}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error saving results:', error);
        throw error;
      }
    }
  }

  async cleanup() {
    await this.closeBrowser();
  }
}

async function main() {
  const scraper = new DirectoryScraper();
  
  try {
    console.log('Starting scraper...');
    
    // Scrape GigSalad
    console.log('\nScraping GigSalad...');
    await scraper.scrapeGigSalad();
    
    // Scrape The Bash
    console.log('\nScraping The Bash...');
    await scraper.scrapeTheBash();
    
    // Save results
    await scraper.saveResults();
    
    console.log('\nScraping completed successfully!');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in scraping process:', error);
      process.exit(1);
    }
  } finally {
    await scraper.cleanup();
  }
}

main();
