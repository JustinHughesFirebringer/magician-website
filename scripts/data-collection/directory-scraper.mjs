import axios from 'axios';
import puppeteer from 'puppeteer';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { setTimeout } from 'timers/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Major cities in each state
const citiesByState = {
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
  constructor() {
    this.results = [];
    this.delay = 2000; // 2 seconds between requests
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new'
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
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
          
          // Navigate to the page and wait for content to load
          await page.goto(url, { 
            waitUntil: ['networkidle0', 'domcontentloaded', 'load']
          });

          // Wait for search results to load
          try {
            await page.waitForSelector('.css-1rynq56', { timeout: 10000 });
          } catch (error) {
            console.log(`No results found for ${city}, ${state}`);
            continue;
          }

          // Wait a bit for any dynamic content to load
          await page.waitForTimeout(2000);

          const vendors = await page.evaluate(() => {
            const results = [];
            // The main container for search results
            document.querySelectorAll('.css-1rynq56').forEach((element) => {
              try {
                // These classes are from inspecting the actual search results
                const nameEl = element.querySelector('h3.chakra-heading');
                const locationEl = element.querySelector('.chakra-text[data-testid="location"]');
                const descriptionEl = element.querySelector('.chakra-text[data-testid="description"]');
                const linkEl = element.querySelector('a[href*="/magician/"]');
                const priceEl = element.querySelector('.chakra-text[data-testid="price"]');

                if (nameEl && locationEl) {
                  const name = nameEl.textContent?.trim() || '';
                  const location = locationEl.textContent?.trim() || '';
                  // Location format is "City, ST"
                  const [city, state] = location.split(', ');
                  const description = descriptionEl?.textContent?.trim() || '';
                  const listingUrl = linkEl?.href;
                  const priceText = priceEl?.textContent?.trim() || '';
                  const priceMatch = priceText.match(/\$(\d+)/);

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
              } catch (error) {
                console.error('Error processing vendor card:', error);
              }
            });
            return results;
          });

          // Log the raw HTML if no vendors found (for debugging)
          if (vendors.length === 0) {
            const html = await page.content();
            console.log('Page HTML:', html);
          }

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
          console.error(`Error processing ${city}, ${state} on The Bash:`, error);
        }
      }
    }

    await page.close();
  }

  // Helper method to scroll the page and load more results
  async autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.documentElement.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  async saveResults() {
    try {
      const outputPath = join(__dirname, '../../data/raw-listings.json');
      await writeFile(outputPath, JSON.stringify(this.results, null, 2));
      console.log(`Successfully saved ${this.results.length} magician listings to ${outputPath}`);
    } catch (error) {
      console.error('Error saving results:', error);
      throw error;
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
    
    // Only scrape The Bash since GigSalad requires authentication
    console.log('\nScraping The Bash...');
    await scraper.scrapeTheBash();
    
    // Save results
    await scraper.saveResults();
    
    console.log('\nScraping completed successfully!');
  } catch (error) {
    console.error('Error in scraping process:', error);
    process.exit(1);
  } finally {
    await scraper.cleanup();
  }
}

main();
