from scrapy import signals
from scrapy.downloadermiddlewares.retry import RetryMiddleware
from scrapy.utils.response import response_status_message
import time
from collections import defaultdict
from datetime import datetime, timedelta
import logging

class DomainRateLimitMiddleware:
    """Middleware to implement per-domain rate limiting."""
    
    def __init__(self):
        self.last_request = defaultdict(lambda: datetime.min)
        self.domain_delays = {
            'thebash.com': 3,      # 3 seconds between requests
            'bark.com': 2,         # 2 seconds between requests
            'gigsalad.com': 2.5    # 2.5 seconds between requests
        }
        self.default_delay = 2     # Default delay for unknown domains
        
    def process_request(self, request, spider):
        domain = request.url.split('/')[2]
        delay = self.domain_delays.get(domain, self.default_delay)
        
        # Calculate time since last request to this domain
        last_req_time = self.last_request[domain]
        now = datetime.now()
        time_passed = (now - last_req_time).total_seconds()
        
        if time_passed < delay:
            sleep_time = delay - time_passed
            time.sleep(sleep_time)
            
        self.last_request[domain] = datetime.now()

class CustomRetryMiddleware(RetryMiddleware):
    """Custom retry middleware with enhanced error handling."""
    
    def __init__(self, settings):
        super().__init__(settings)
        self.max_retry_times = settings.getint('RETRY_TIMES', 3)
        self.retry_http_codes = set(int(x) for x in settings.getlist('RETRY_HTTP_CODES', [500, 502, 503, 504, 408, 429]))
        self.priority_adjust = settings.getint('RETRY_PRIORITY_ADJUST', -1)
        
    def process_response(self, request, response, spider):
        if request.meta.get('dont_retry', False):
            return response
            
        if response.status in self.retry_http_codes:
            reason = response_status_message(response.status)
            spider.logger.warning(
                f'Retrying {request.url} (failed with {response.status}): {reason}'
            )
            return self._retry(request, reason, spider) or response
            
        # Check for common error patterns in response
        error_patterns = [
            'too many requests',
            'service unavailable',
            'internal server error',
            'gateway timeout'
        ]
        
        response_body = response.body.lower().decode('utf-8', errors='ignore')
        for pattern in error_patterns:
            if pattern in response_body:
                spider.logger.warning(
                    f'Error pattern "{pattern}" found in response from {request.url}'
                )
                return self._retry(request, pattern, spider) or response
                
        return response
        
    def process_exception(self, request, exception, spider):
        spider.logger.error(
            f'Error processing {request.url}: {type(exception).__name__}: {str(exception)}'
        )
        return super().process_exception(request, exception, spider)

class DataCleaningMiddleware:
    """Middleware for cleaning and normalizing scraped data."""
    
    @classmethod
    def from_crawler(cls, crawler):
        middleware = cls()
        crawler.signals.connect(middleware.spider_opened, signal=signals.spider_opened)
        return middleware
        
    def spider_opened(self, spider):
        spider.logger.info('Data cleaning middleware enabled')
        
    def process_spider_output(self, response, result, spider):
        for item in result:
            if isinstance(item, dict):
                yield self.clean_item(item, spider)
            else:
                yield item
                
    def clean_item(self, item, spider):
        """Clean and normalize item data."""
        try:
            # Clean basic fields
            if 'name' in item:
                item['name'] = self.clean_text(item['name'])
                
            if 'description' in item:
                item['description'] = self.clean_text(item['description'])
                
            # Normalize services
            if 'services' in item:
                item['services'] = [
                    self.clean_text(service) 
                    for service in item['services'] 
                    if service
                ]
                item['services'] = self.normalize_services(item['services'])
                
            # Clean location data
            if 'location' in item:
                if isinstance(item['location'], dict):
                    for key in ['city', 'state']:
                        if key in item['location']:
                            item['location'][key] = self.clean_text(
                                item['location'][key]
                            )
                            
            # Normalize pricing
            if 'pricing' in item and isinstance(item['pricing'], dict):
                item['pricing'] = self.normalize_pricing(item['pricing'])
                
            # Clean contact information
            if 'contact' in item and isinstance(item['contact'], dict):
                item['contact'] = self.clean_contact_info(item['contact'])
                
            # Validate and clean dates
            if 'last_updated' in item:
                item['last_updated'] = self.validate_date(item['last_updated'])
                
        except Exception as e:
            spider.logger.error(f'Error cleaning item: {str(e)}')
            
        return item
        
    def clean_text(self, text):
        """Clean and normalize text fields."""
        if not text:
            return None
            
        text = str(text).strip()
        # Remove excessive whitespace
        text = ' '.join(text.split())
        # Remove common HTML artifacts
        text = text.replace('&nbsp;', ' ').replace('&amp;', '&')
        return text if text else None
        
    def normalize_services(self, services):
        """Normalize service names."""
        service_mapping = {
            'close up': 'Close-up Magic',
            'close-up': 'Close-up Magic',
            'closeup': 'Close-up Magic',
            'stage': 'Stage Magic',
            'stage magic': 'Stage Magic',
            'mentalism': 'Mentalism',
            'mind reading': 'Mentalism',
            'kids': 'Children\'s Magic',
            'children': 'Children\'s Magic',
            'birthday': 'Children\'s Magic',
            'corporate': 'Corporate Magic',
            'business': 'Corporate Magic'
        }
        
        normalized = []
        for service in services:
            service = service.lower()
            for key, value in service_mapping.items():
                if key in service:
                    normalized.append(value)
                    break
            else:
                normalized.append(service.title())
                
        return list(set(normalized))
        
    def normalize_pricing(self, pricing):
        """Normalize pricing information."""
        if not isinstance(pricing, dict):
            return pricing
            
        # Convert all prices to float
        if 'starting_price' in pricing:
            price = pricing['starting_price']
            if isinstance(price, str):
                pricing['starting_price'] = self.extract_price(price)
                
        # Normalize price ranges
        if 'price_range' in pricing:
            range_text = pricing['price_range']
            if isinstance(range_text, str):
                prices = self.extract_price_range(range_text)
                pricing['price_range'] = {
                    'min': prices[0] if prices else None,
                    'max': prices[1] if prices and len(prices) > 1 else None
                }
                
        return pricing
        
    def clean_contact_info(self, contact):
        """Clean and validate contact information."""
        if not isinstance(contact, dict):
            return contact
            
        # Clean phone numbers
        if 'phone' in contact:
            contact['phone'] = self.normalize_phone(contact['phone'])
            
        # Clean email addresses
        if 'email' in contact:
            contact['email'] = self.clean_text(contact['email'])
            
        # Clean website URLs
        if 'website' in contact:
            contact['website'] = self.clean_text(contact['website'])
            
        return contact
        
    def normalize_phone(self, phone):
        """Normalize phone number format."""
        if not phone:
            return None
            
        # Remove all non-numeric characters
        digits = ''.join(filter(str.isdigit, str(phone)))
        
        # Format as (XXX) XXX-XXXX if 10 digits
        if len(digits) == 10:
            return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        elif len(digits) == 11 and digits[0] == '1':
            return f"({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
            
        return phone
        
    def validate_date(self, date_str):
        """Validate and normalize date format."""
        try:
            if isinstance(date_str, str):
                # Parse ISO format date
                datetime.fromisoformat(date_str)
            return date_str
        except (ValueError, TypeError):
            return datetime.now().isoformat()
