import time
import psutil
import logging
from dataclasses import dataclass
from typing import Dict, List
from datetime import datetime
import aiohttp
import asyncio
from pathlib import Path
import json

@dataclass
class PerformanceMetrics:
    timestamp: str
    page_load_time: float
    memory_usage: float
    cpu_usage: float
    response_time: float
    error_count: int

class PerformanceMonitor:
    def __init__(self, base_url: str, output_dir: str):
        self.base_url = base_url
        self.output_dir = Path(output_dir)
        self.logger = logging.getLogger(__name__)
        self.metrics_file = self.output_dir / 'performance_metrics.json'
        self.error_threshold = 1000  # ms
        self.setup_logging()

    def setup_logging(self):
        """Setup logging configuration."""
        self.output_dir.mkdir(exist_ok=True)
        logging.basicConfig(
            filename=self.output_dir / 'performance.log',
            level=logging.INFO,
            format='%(asctime)s [%(levelname)s] %(message)s'
        )

    async def collect_metrics(self) -> PerformanceMetrics:
        """Collect current performance metrics."""
        start_time = time.time()
        
        try:
            # Measure system metrics
            cpu_usage = psutil.cpu_percent()
            memory_usage = psutil.Process().memory_percent()
            
            # Measure response time
            async with aiohttp.ClientSession() as session:
                response_time = await self.measure_response_time(session)
            
            # Count errors in log
            error_count = await self.count_recent_errors()
            
            # Calculate page load time
            page_load_time = time.time() - start_time
            
            metrics = PerformanceMetrics(
                timestamp=datetime.now().isoformat(),
                page_load_time=page_load_time,
                memory_usage=memory_usage,
                cpu_usage=cpu_usage,
                response_time=response_time,
                error_count=error_count
            )
            
            await self.save_metrics(metrics)
            await self.check_alerts(metrics)
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"Error collecting metrics: {str(e)}")
            raise

    async def measure_response_time(self, session: aiohttp.ClientSession) -> float:
        """Measure response time for the main page."""
        start_time = time.time()
        try:
            async with session.get(f"{self.base_url}/index.html") as response:
                await response.text()
                return (time.time() - start_time) * 1000  # Convert to ms
        except Exception as e:
            self.logger.error(f"Error measuring response time: {str(e)}")
            return -1

    async def count_recent_errors(self) -> int:
        """Count errors in the last hour from logs."""
        try:
            error_count = 0
            current_time = time.time()
            hour_ago = current_time - 3600
            
            log_file = self.output_dir / 'error.log'
            if log_file.exists():
                async with aiohttp.ClientSession() as session:
                    async with session.get(str(log_file)) as response:
                        log_content = await response.text()
                        for line in log_content.splitlines():
                            try:
                                # Parse log timestamp
                                timestamp_str = line.split('[')[0].strip()
                                timestamp = datetime.fromisoformat(timestamp_str)
                                if timestamp.timestamp() > hour_ago:
                                    if '[ERROR]' in line:
                                        error_count += 1
                            except Exception:
                                continue
                                
            return error_count
            
        except Exception as e:
            self.logger.error(f"Error counting errors: {str(e)}")
            return 0

    async def save_metrics(self, metrics: PerformanceMetrics):
        """Save metrics to JSON file."""
        try:
            # Load existing metrics
            existing_metrics = []
            if self.metrics_file.exists():
                async with aiohttp.ClientSession() as session:
                    async with session.get(str(self.metrics_file)) as response:
                        content = await response.text()
                        existing_metrics = json.loads(content)
            
            # Add new metrics
            existing_metrics.append({
                'timestamp': metrics.timestamp,
                'page_load_time': metrics.page_load_time,
                'memory_usage': metrics.memory_usage,
                'cpu_usage': metrics.cpu_usage,
                'response_time': metrics.response_time,
                'error_count': metrics.error_count
            })
            
            # Keep only last 24 hours of metrics
            cutoff_time = (
                datetime.now() - timedelta(hours=24)
            ).isoformat()
            existing_metrics = [
                m for m in existing_metrics
                if m['timestamp'] > cutoff_time
            ]
            
            # Save updated metrics
            async with aiohttp.ClientSession() as session:
                async with session.put(
                    str(self.metrics_file),
                    json=existing_metrics
                ) as response:
                    await response.text()
                    
        except Exception as e:
            self.logger.error(f"Error saving metrics: {str(e)}")

    async def check_alerts(self, metrics: PerformanceMetrics):
        """Check metrics against thresholds and send alerts if needed."""
        alerts = []
        
        if metrics.response_time > self.error_threshold:
            alerts.append(
                f"High response time: {metrics.response_time:.2f}ms"
            )
            
        if metrics.cpu_usage > 80:
            alerts.append(
                f"High CPU usage: {metrics.cpu_usage:.2f}%"
            )
            
        if metrics.memory_usage > 80:
            alerts.append(
                f"High memory usage: {metrics.memory_usage:.2f}%"
            )
            
        if metrics.error_count > 10:
            alerts.append(
                f"High error count: {metrics.error_count}"
            )
            
        if alerts:
            await self.send_alerts(alerts)

    async def send_alerts(self, alerts: List[str]):
        """Send alerts through configured channels."""
        alert_message = "\n".join(alerts)
        self.logger.warning(f"Performance Alerts:\n{alert_message}")
        
        # Here you would implement actual alert sending
        # (e.g., email, Slack, SMS)
