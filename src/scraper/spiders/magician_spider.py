import scrapy
import json
from datetime import datetime
from typing import Dict, List, Any
from pathlib import Path
from urllib.parse import urljoin
import re

class MagicianSpider(scrapy.Spider):
    name = 'magician_spider'
    custom_settings = {
        'ROBOTSTXT_OBEY': True,
        'CONCURRENT_REQUESTS': 16,
        'DOWNLOAD_DELAY': 2,
        'USER_AGENT': 'MagicianDirectory Bot (+https://example.com/bot)'
    }

    def __init__(self, *args, **kwargs):
        super(MagicianSpider, self).__init__(*args, **kwargs)
        self.existing_magicians = self._load_existing_magicians()
        
    def _load_existing_magicians(self) -> Dict[str, Any]:
        magicians_file = Path('data/magicians.json')
        if magicians_file.exists():
            with open(magicians_file, 'r') as f:
                return json.load(f)
        return {"magicians": []}

    def start_requests(self):
        start_urls = {
            'https://www.thebash.com/services/magician': self.parse_thebash,
            'https://www.bark.com/en/us/magician/': self.parse_bark,
            'https://www.gigsalad.com/Magic/Magician': self.parse_gigsalad
        }
        
        for url, callback in start_urls.items():
            yield scrapy.Request(
                url=url,
                callback=callback,
                errback=self.handle_error,
                meta={'source': url.split('/')[2]}
            )

    def parse_thebash(self, response):
        """Parse magician listings from TheBash."""
        magicians = response.css('.vendor-card')
        
        for magician in magicians:
            profile_url = urljoin(response.url, magician.css('.vendor-card__link::attr(href)').get())
            basic_info = {
                'id': f"tb_{magician.css('::attr(data-vendor-id)').get()}",
                'name': magician.css('.vendor-card__name::text').get().strip(),
                'services': [
                    service.strip()
                    for service in magician.css('.vendor-card__categories::text').getall()
                ],
                'location': {
                    'city': magician.css('.vendor-card__location::text').get().split(',')[0].strip(),
                    'state': magician.css('.vendor-card__location::text').get().split(',')[1].strip(),
                    'coordinates': {'latitude': None, 'longitude': None}
                },
                'rating': float(magician.css('.vendor-card__rating-score::text').get() or 0),
                'reviews_count': int(magician.css('.vendor-card__rating-count::text').re_first(r'\d+') or 0),
                'source': 'thebash'
            }
            
            yield scrapy.Request(
                url=profile_url,
                callback=self.parse_thebash_profile,
                meta={'basic_info': basic_info},
                errback=self.handle_error
            )

        next_page = response.css('.pagination__next::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse_thebash)

    def parse_thebash_profile(self, response):
        """Parse detailed magician profile from TheBash."""
        basic_info = response.meta['basic_info']
        
        profile_data = {
            **basic_info,
            'description': response.css('.vendor-bio::text').get('').strip(),
            'experience_years': self._extract_years(
                response.css('.vendor-experience::text').get('')
            ),
            'performance_types': response.css('.performance-types li::text').getall(),
            'travel_distance': response.css('.travel-distance::text').get('').strip(),
            'insurance': {
                'has_insurance': bool(response.css('.insurance-badge').get()),
                'details': response.css('.insurance-details::text').get('').strip()
            },
            'pricing': {
                'starting_price': self._extract_price(
                    response.css('.starting-price::text').get('')
                ),
                'price_range': response.css('.price-range::text').get('').strip()
            },
            'contact': {
                'phone': response.css('.contact-phone::text').get(''),
                'email': response.css('.contact-email::text').get(''),
                'website': response.url
            },
            'social_media': {
                'facebook': response.css('.social-facebook::attr(href)').get(''),
                'instagram': response.css('.social-instagram::attr(href)').get(),
                'youtube': response.css('.social-youtube::attr(href)').get()
            },
            'last_updated': datetime.now().isoformat()
        }
        
        yield profile_data

    def parse_bark(self, response):
        """Parse magician listings from Bark."""
        magicians = response.css('.professional-card')
        
        for magician in magicians:
            profile_url = urljoin(response.url, magician.css('.pro-profile-link::attr(href)').get())
            basic_info = {
                'id': f"bark_{magician.css('::attr(data-pro-id)').get()}",
                'name': magician.css('.pro-name::text').get().strip(),
                'services': [
                    service.strip()
                    for service in magician.css('.pro-services li::text').getall()
                ],
                'location': {
                    'city': magician.css('.pro-location::text').get().split(',')[0].strip(),
                    'state': magician.css('.pro-location::text').get().split(',')[1].strip(),
                    'coordinates': {'latitude': None, 'longitude': None}
                },
                'rating': float(magician.css('.pro-rating::text').get() or 0),
                'reviews_count': int(magician.css('.review-count::text').re_first(r'\d+') or 0),
                'source': 'bark'
            }
            
            yield scrapy.Request(
                url=profile_url,
                callback=self.parse_bark_profile,
                meta={'basic_info': basic_info},
                errback=self.handle_error
            )

        next_page = response.css('.pagination-next::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse_bark)

    def parse_bark_profile(self, response):
        """Parse detailed magician profile from Bark."""
        basic_info = response.meta['basic_info']
        
        profile_data = {
            **basic_info,
            'description': response.css('.pro-description::text').get('').strip(),
            'badges': response.css('.pro-badges span::text').getall(),
            'response_time': response.css('.response-time::text').get('').strip(),
            'services_offered': response.css('.services-list li::text').getall(),
            'availability': {
                'days': response.css('.availability-days li::text').getall(),
                'hours': response.css('.availability-hours::text').get('').strip()
            },
            'pricing': {
                'rate_type': response.css('.rate-type::text').get('').strip(),
                'rate_range': response.css('.rate-range::text').get('').strip()
            },
            'contact': {
                'phone': None,  # Usually hidden behind contact form
                'email': None,
                'website': response.url
            },
            'last_updated': datetime.now().isoformat()
        }
        
        yield profile_data

    def parse_gigsalad(self, response):
        """Parse magician listings from GigSalad."""
        magicians = response.css('.performer-card')
        
        for magician in magicians:
            profile_url = urljoin(response.url, magician.css('.performer-link::attr(href)').get())
            basic_info = {
                'id': f"gs_{magician.css('::attr(data-performer-id)').get()}",
                'name': magician.css('.performer-name::text').get().strip(),
                'services': [
                    service.strip()
                    for service in magician.css('.performer-categories span::text').getall()
                ],
                'location': {
                    'city': magician.css('.performer-location::text').get().split(',')[0].strip(),
                    'state': magician.css('.performer-location::text').get().split(',')[1].strip(),
                    'coordinates': {'latitude': None, 'longitude': None}
                },
                'rating': float(magician.css('.performer-rating::text').get() or 0),
                'reviews_count': int(magician.css('.review-count::text').re_first(r'\d+') or 0),
                'source': 'gigsalad'
            }
            
            yield scrapy.Request(
                url=profile_url,
                callback=self.parse_gigsalad_profile,
                meta={'basic_info': basic_info},
                errback=self.handle_error
            )

        next_page = response.css('.pagination__next::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse_gigsalad)

    def parse_gigsalad_profile(self, response):
        """Parse detailed magician profile from GigSalad."""
        basic_info = response.meta['basic_info']
        
        profile_data = {
            **basic_info,
            'description': response.css('.bio-content::text').get('').strip(),
            'performance_length': response.css('.performance-length::text').get('').strip(),
            'languages': response.css('.languages li::text').getall(),
            'payment_methods': response.css('.payment-methods li::text').getall(),
            'cancellation_policy': response.css('.cancellation-policy::text').get('').strip(),
            'insurance': {
                'has_insurance': bool(response.css('.insurance-verified').get()),
                'details': response.css('.insurance-details::text').get('').strip()
            },
            'equipment': {
                'provides': response.css('.equipment-provides li::text').getall(),
                'needs': response.css('.equipment-needs li::text').getall()
            },
            'pricing': {
                'starting_price': self._extract_price(
                    response.css('.starting-price::text').get('')
                ),
                'packages': [
                    {
                        'name': package.css('.package-name::text').get('').strip(),
                        'price': self._extract_price(
                            package.css('.package-price::text').get('')
                        ),
                        'description': package.css('.package-description::text').get('').strip()
                    }
                    for package in response.css('.pricing-package')
                ]
            },
            'contact': {
                'phone': None,  # Usually hidden behind booking system
                'email': None,
                'website': response.url
            },
            'last_updated': datetime.now().isoformat()
        }
        
        yield profile_data

    def _extract_price(self, price_text: str) -> float:
        """Extract numeric price from text."""
        if not price_text:
            return None
        matches = re.findall(r'\$(\d+(?:,\d+)?(?:\.\d+)?)', price_text)
        return float(matches[0].replace(',', '')) if matches else None

    def _extract_years(self, experience_text: str) -> int:
        """Extract years of experience from text."""
        if not experience_text:
            return None
        matches = re.findall(r'(\d+)(?:\s+)?(?:years?|yrs?)', experience_text.lower())
        return int(matches[0]) if matches else None

    def handle_error(self, failure):
        """Handle request failures and log them."""
        self.logger.error(f'Request failed: {failure.request.url}')
        self.logger.error(f'Source: {failure.request.meta.get("source")}')
        self.logger.error(failure.getErrorMessage())
