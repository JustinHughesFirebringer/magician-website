BOT_NAME = 'magician_scraper'

SPIDER_MODULES = ['src.scraper.spiders']
NEWSPIDER_MODULE = 'src.scraper.spiders'

# Crawl responsibly by identifying yourself
USER_AGENT = 'MagicianDirectory Bot (+https://example.com/bot)'

# Obey robots.txt rules
ROBOTSTXT_OBEY = True

# Configure maximum concurrent requests
CONCURRENT_REQUESTS = 16
CONCURRENT_REQUESTS_PER_DOMAIN = 4

# Configure retry settings
RETRY_ENABLED = True
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 408, 429]
RETRY_PRIORITY_ADJUST = -1

# Configure a delay for requests for the same website
DOWNLOAD_DELAY = 1

# Enable or disable downloader middlewares
DOWNLOADER_MIDDLEWARES = {
    'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware': None,
    'scrapy.downloadermiddlewares.retry.RetryMiddleware': None,
    'scraper.middlewares.CustomRetryMiddleware': 550,
    'scraper.middlewares.DomainRateLimitMiddleware': 750,
    'scrapy.downloadermiddlewares.httpproxy.HttpProxyMiddleware': 110,
}

# Enable spider middlewares
SPIDER_MIDDLEWARES = {
    'scraper.middlewares.DataCleaningMiddleware': 100,
}

# Configure item pipelines
ITEM_PIPELINES = {
    'scraper.pipelines.MagicianPipeline': 300,
}

# Enable and configure HTTP caching
HTTPCACHE_ENABLED = True
HTTPCACHE_EXPIRATION_SECS = 86400  # 24 hours
HTTPCACHE_DIR = 'httpcache'

# Configure logging
LOG_LEVEL = 'INFO'
LOG_FILE = 'scraper.log'
LOG_FORMAT = '%(asctime)s [%(name)s] %(levelname)s: %(message)s'

# Custom settings
CLOSESPIDER_ERRORCOUNT = 5  # Stop spider after 5 errors
DOWNLOAD_TIMEOUT = 30  # 30 seconds timeout for requests

# Auto throttle settings
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 5
AUTOTHROTTLE_MAX_DELAY = 60
AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0
AUTOTHROTTLE_DEBUG = False
