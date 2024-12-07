from PIL import Image
import os
from pathlib import Path
from typing import Tuple, Dict
import hashlib
import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor

class ImageOptimizer:
    def __init__(self, input_dir: str, output_dir: str):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.logger = logging.getLogger(__name__)
        self.sizes = {
            'thumbnail': (150, 150),
            'medium': (300, 300),
            'large': (800, 800)
        }
        self.quality = 85
        self.format = 'WEBP'

    async def optimize_images(self):
        """Optimize all images in the input directory."""
        self.output_dir.mkdir(exist_ok=True)
        
        # Get list of all image files
        image_files = []
        for ext in ('*.jpg', '*.jpeg', '*.png'):
            image_files.extend(self.input_dir.glob(f'**/{ext}'))

        # Process images in parallel
        with ThreadPoolExecutor() as executor:
            tasks = [
                self._process_image(img_path, executor)
                for img_path in image_files
            ]
            await asyncio.gather(*tasks)

    async def _process_image(self, image_path: Path, executor):
        """Process a single image file."""
        try:
            # Generate hash of image content for cache busting
            file_hash = self._get_file_hash(image_path)
            
            # Process each size variant
            for size_name, dimensions in self.sizes.items():
                output_path = self._get_output_path(
                    image_path, size_name, file_hash
                )
                
                if not output_path.exists():
                    # Run image processing in thread pool
                    await asyncio.get_event_loop().run_in_executor(
                        executor,
                        self._resize_and_optimize,
                        image_path,
                        output_path,
                        dimensions
                    )
                    
                    self.logger.info(
                        f"Optimized {image_path.name} - {size_name}"
                    )

        except Exception as e:
            self.logger.error(
                f"Error processing {image_path}: {str(e)}"
            )

    def _get_file_hash(self, file_path: Path) -> str:
        """Generate MD5 hash of file content."""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()[:8]

    def _get_output_path(
        self, input_path: Path, size_name: str, file_hash: str
    ) -> Path:
        """Generate output path for processed image."""
        stem = input_path.stem
        relative_path = input_path.relative_to(self.input_dir)
        output_path = self.output_dir / relative_path.parent / size_name
        output_path.mkdir(parents=True, exist_ok=True)
        return output_path / f"{stem}-{file_hash}.webp"

    def _resize_and_optimize(
        self, input_path: Path, output_path: Path, dimensions: Tuple[int, int]
    ):
        """Resize and optimize a single image."""
        with Image.open(input_path) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Resize image
            img.thumbnail(dimensions, Image.Resampling.LANCZOS)
            
            # Save optimized image
            img.save(
                output_path,
                format=self.format,
                quality=self.quality,
                optimize=True
            )
