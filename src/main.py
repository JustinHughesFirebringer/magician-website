import logging
from pathlib import Path
import asyncio
import json
from datetime import datetime
from typing import Dict, List
import aiofiles
from page_generator import PageGenerator
from scraper.run_scraper import run_spider

class MagicianWebsiteBuilder:
    def __init__(self):
        self.logger = self._setup_logging()
        self.base_dir = Path(__file__).resolve().parent.parent
        self.output_dir = self.base_dir / 'output'
        self.data_dir = self.base_dir / 'data'
        self.template_dir = self.base_dir / 'templates'
        self.page_generator = PageGenerator(str(self.template_dir))

    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration."""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s [%(levelname)s] %(message)s',
            handlers=[
                logging.FileHandler('website_builder.log'),
                logging.StreamHandler()
            ]
        )
        return logging.getLogger(__name__)

    async def _ensure_directories(self):
        """Ensure all required directories exist."""
        for directory in [self.output_dir, self.data_dir]:
            directory.mkdir(exist_ok=True)
            self.logger.info(f"Ensured directory exists: {directory}")

    async def _load_json_data(self, filepath: Path) -> Dict:
        """Load JSON data from file."""
        try:
            async with aiofiles.open(filepath, 'r') as f:
                content = await f.read()
                return json.loads(content)
        except Exception as e:
            self.logger.error(f"Error loading {filepath}: {str(e)}")
            raise

    async def generate_sitemap(self) -> str:
        """Generate XML sitemap for all city pages."""
        self.logger.info("Generating sitemap...")
        cities_data = await self._load_json_data(self.data_dir / 'cities.json')
        
        sitemap_path = self.output_dir / 'sitemap.xml'
        urls = []
        
        for city in cities_data['cities']:
            city_url = f"https://example.com/magicians/{city['name'].lower()}-{city['state'].lower()}.html"
            urls.append({
                'loc': city_url,
                'lastmod': datetime.now().strftime('%Y-%m-%d'),
                'changefreq': 'weekly',
                'priority': '0.8'
            })

        # Add other important pages
        urls.append({
            'loc': 'https://example.com/index.html',
            'lastmod': datetime.now().strftime('%Y-%m-%d'),
            'changefreq': 'daily',
            'priority': '1.0'
        })

        sitemap_content = self.page_generator.generate_sitemap(urls)
        async with aiofiles.open(sitemap_path, 'w') as f:
            await f.write(sitemap_content)

        self.logger.info(f"Sitemap generated at {sitemap_path}")
        return str(sitemap_path)

    async def generate_robots_txt(self):
        """Generate robots.txt file."""
        self.logger.info("Generating robots.txt...")
        robots_content = """User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml"""

        robots_path = self.output_dir / 'robots.txt'
        async with aiofiles.open(robots_path, 'w') as f:
            await f.write(robots_content)

        self.logger.info(f"robots.txt generated at {robots_path}")

    async def generate_city_pages(self):
        """Generate individual pages for each city."""
        self.logger.info("Generating city pages...")
        cities_data = await self._load_json_data(self.data_dir / 'cities.json')
        magicians_data = await self._load_json_data(self.data_dir / 'magicians.json')

        for city in cities_data['cities']:
            try:
                # Filter magicians for this city
                city_magicians = [
                    m for m in magicians_data['magicians']
                    if m['location']['city'].lower() == city['name'].lower()
                    and m['location']['state'].lower() == city['state'].lower()
                ]

                # Generate page content
                page_content = self.page_generator.generate_city_page({
                    'city': city,
                    'magicians': city_magicians
                })

                # Save the page
                page_path = self.output_dir / f"magicians/{city['name'].lower()}-{city['state'].lower()}.html"
                page_path.parent.mkdir(exist_ok=True)
                
                async with aiofiles.open(page_path, 'w') as f:
                    await f.write(page_content)

                self.logger.info(f"Generated page for {city['name']}, {city['state']}")

            except Exception as e:
                self.logger.error(f"Error generating page for {city['name']}, {city['state']}: {str(e)}")

    async def generate_index_page(self):
        """Generate main index page."""
        self.logger.info("Generating index page...")
        cities_data = await self._load_json_data(self.data_dir / 'cities.json')
        
        index_content = self.page_generator.generate_index_page({
            'cities': cities_data['cities']
        })
        
        index_path = self.output_dir / 'index.html'
        async with aiofiles.open(index_path, 'w') as f:
            await f.write(index_content)

        self.logger.info("Index page generated")

    async def copy_static_assets(self):
        """Copy static assets to output directory."""
        self.logger.info("Copying static assets...")
        static_dir = self.base_dir / 'static'
        output_static = self.output_dir / 'static'
        output_static.mkdir(exist_ok=True)

        # Copy CSS, JS, and images
        for asset_type in ['css', 'js', 'images']:
            src_dir = static_dir / asset_type
            dst_dir = output_static / asset_type
            if src_dir.exists():
                dst_dir.mkdir(exist_ok=True)
                for file in src_dir.glob('**/*'):
                    if file.is_file():
                        dst_file = dst_dir / file.relative_to(src_dir)
                        dst_file.parent.mkdir(exist_ok=True)
                        dst_file.write_bytes(file.read_bytes())

        self.logger.info("Static assets copied")

    async def build_website(self):
        """Main method to build the entire website."""
        try:
            self.logger.info("Starting website build process...")
            
            # Ensure directories exist
            await self._ensure_directories()
            
            # Run scraper to update data
            self.logger.info("Running scraper to update magician data...")
            run_spider()
            
            # Generate all pages and assets
            await asyncio.gather(
                self.generate_city_pages(),
                self.generate_index_page(),
                self.generate_sitemap(),
                self.generate_robots_txt(),
                self.copy_static_assets()
            )
            
            self.logger.info("Website build completed successfully!")
            
        except Exception as e:
            self.logger.error(f"Error building website: {str(e)}")
            raise

if __name__ == "__main__":
    builder = MagicianWebsiteBuilder()
    asyncio.run(builder.build_website())
