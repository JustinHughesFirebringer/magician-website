import json
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
from typing import Dict, List

class PageGenerator:
    def __init__(self, template_dir: str = "templates"):
        self.base_dir = Path(__file__).resolve().parent.parent
        self.template_dir = self.base_dir / template_dir
        self.data_dir = self.base_dir / 'data'
        self.env = Environment(loader=FileSystemLoader(str(self.template_dir)))
        self.cities = self._load_json("cities.json")
        self.magicians = self._load_json("magicians.json")
        
    def _load_json(self, filename: str) -> Dict:
        file_path = self.data_dir / filename
        if file_path.exists():
            with open(file_path, 'r') as f:
                return json.load(f)
        return {}
            
    def generate_city_page(self, city: Dict) -> str:
        """Generate HTML content for a specific city."""
        template = self.env.get_template("city_page.html")
        local_magicians = self._get_magicians_in_city(city["name"], city["state"])
        
        return template.render(
            city=city,
            magicians=local_magicians,
            meta_title=f"Magicians in {city['name']}, {city['state']} - Book Local Magic Shows",
            meta_description=f"Find and book professional magicians in {city['name']}, {city['state']}. "
                           f"View profiles, read reviews, and contact magicians for your next event."
        )
        
    def _get_magicians_in_city(self, city: str, state: str) -> List[Dict]:
        """Filter magicians by city and state."""
        return [
            magician for magician in self.magicians["magicians"]
            if magician["location"]["city"].lower() == city.lower() 
            and magician["location"]["state"].lower() == state.lower()
        ]
        
    def generate_all_pages(self, output_dir: str = "output"):
        """Generate pages for all cities."""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        for city in self.cities["cities"]:
            city_html = self.generate_city_page(city)
            city_path = output_path / f"{city['name'].lower()}-{city['state'].lower()}.html"
            
            with open(city_path, 'w') as f:
                f.write(city_html)
                
    def generate_sitemap(self, base_url: str, output_dir: str = "output") -> str:
        """Generate XML sitemap for all city pages."""
        template = self.env.get_template("sitemap.xml")
        urls = []
        
        for city in self.cities["cities"]:
            urls.append({
                "loc": f"{base_url}/{city['name'].lower()}-{city['state'].lower()}.html",
                "lastmod": "2024-01-01",  # This should be dynamic in production
                "changefreq": "weekly",
                "priority": "0.8"
            })
            
        sitemap_content = template.render(urls=urls)
        sitemap_path = Path(output_dir) / "sitemap.xml"
        
        with open(sitemap_path, 'w') as f:
            f.write(sitemap_content)
            
        return str(sitemap_path)
