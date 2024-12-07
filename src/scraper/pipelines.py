import json
from pathlib import Path
from typing import Dict, Any
from datetime import datetime

class MagicianPipeline:
    def __init__(self):
        self.base_dir = Path(__file__).resolve().parent.parent.parent
        self.data_dir = self.base_dir / 'data'
        self.magicians = []
        self.existing_magicians = self._load_existing_magicians()

    def _load_existing_magicians(self) -> Dict[str, Any]:
        magicians_file = self.data_dir / 'magicians.json'
        if magicians_file.exists():
            with open(magicians_file, 'r') as f:
                return json.load(f)
        return {"magicians": []}

    def process_item(self, item: Dict[str, Any], spider) -> Dict[str, Any]:
        # Clean and validate data
        item = self._clean_item(item)
        
        # Update existing entry or add new one
        existing_index = next(
            (i for i, m in enumerate(self.existing_magicians['magicians'])
             if m['id'] == item['id']),
            None
        )
        
        if existing_index is not None:
            self.existing_magicians['magicians'][existing_index] = item
        else:
            self.existing_magicians['magicians'].append(item)
        
        return item

    def _clean_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and validate magician data."""
        # Remove None values
        item = {k: v for k, v in item.items() if v is not None}
        
        # Ensure required fields
        required_fields = ['id', 'name', 'location']
        for field in required_fields:
            if field not in item:
                raise ValueError(f"Missing required field: {field}")
        
        # Normalize strings
        if 'name' in item:
            item['name'] = item['name'].strip()
        
        # Ensure lists are unique
        if 'services' in item:
            item['services'] = list(set(item['services']))
        if 'specialties' in item:
            item['specialties'] = list(set(item['specialties']))
        
        return item

    def close_spider(self, spider):
        """Save updated magician data when spider closes."""
        output_path = self.data_dir / 'magicians.json'
        output_path.parent.mkdir(exist_ok=True)
        
        # Sort magicians by name for consistent output
        self.existing_magicians['magicians'].sort(key=lambda x: x['name'])
        
        # Add metadata
        self.existing_magicians['last_updated'] = datetime.now().isoformat()
        self.existing_magicians['total_count'] = len(
            self.existing_magicians['magicians']
        )
        
        with open(output_path, 'w') as f:
            json.dump(self.existing_magicians, f, indent=2)
