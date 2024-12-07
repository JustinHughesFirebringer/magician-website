FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy package.json and install Node dependencies if needed
COPY package*.json ./
RUN if [ -f package.json ]; then npm install; fi

# Copy application code
COPY . .

# Set up Scrapy project structure
RUN mkdir -p /app/src/scraper/spiders
ENV PYTHONPATH=/app

# Build static assets if needed
RUN if [ -f build.js ]; then npm run build; fi

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["python", "src/main.py"]
