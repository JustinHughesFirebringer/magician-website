from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from pathlib import Path
import logging
import sys

def setup_logging():
    """Configure logging for the scraper."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s',
        handlers=[
            logging.FileHandler('scraper.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )

def run_spider():
    """Run the magician spider to collect data."""
    try:
        # Ensure data directory exists
        Path('data').mkdir(exist_ok=True)
        
        # Setup logging
        setup_logging()
        logger = logging.getLogger(__name__)
        
        # Load Scrapy settings
        settings = get_project_settings()
        
        # Initialize and run the crawler
        process = CrawlerProcess(settings)
        process.crawl('magician_spider')
        
        logger.info("Starting magician data collection...")
        process.start()
        logger.info("Magician data collection completed successfully")
        
    except Exception as e:
        logger.error(f"Error during scraping: {str(e)}")
        raise

if __name__ == '__main__':
    run_spider()
