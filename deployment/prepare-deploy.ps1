# Prepare deployment script
$ErrorActionPreference = 'Stop'

Write-Host " Preparing deployment package for magiciannearme.store..." -ForegroundColor Green

# Create deployment directory if it doesn't exist
$deployDir = "deployment/package"
if (Test-Path $deployDir) {
    Remove-Item -Path $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Ensure public directory exists
if (-not (Test-Path "public")) {
    New-Item -ItemType Directory -Path "public" | Out-Null
}

# Install production dependencies
Write-Host " Installing production dependencies..." -ForegroundColor Yellow
npm ci --production

# Build the application
Write-Host " Building the application..." -ForegroundColor Yellow
npm run build

# Copy necessary files
Write-Host " Copying files to deployment package..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Copy-Item -Path ".next" -Destination "$deployDir/.next" -Recurse
}
Copy-Item -Path "public" -Destination "$deployDir/public" -Recurse
Copy-Item -Path "node_modules" -Destination "$deployDir/node_modules" -Recurse
Copy-Item -Path "package.json" -Destination "$deployDir/package.json"

# Copy .env if it exists, create a default one if it doesn't
if (Test-Path ".env") {
    Copy-Item -Path ".env" -Destination "$deployDir/.env"
} else {
    @"
NODE_ENV=production
PORT=3000
HOSTNAME=magiciannearme.store
"@ | Set-Content "$deployDir/.env"
}

Copy-Item -Path "deployment/ecosystem.config.js" -Destination "$deployDir/ecosystem.config.js"

# Create deployment archive
Write-Host " Creating deployment archive..." -ForegroundColor Yellow
Compress-Archive -Path "$deployDir/*" -DestinationPath "deployment/magician-website.zip" -Force

Write-Host " Deployment package prepared successfully!" -ForegroundColor Green
Write-Host " Package location: deployment/magician-website.zip" -ForegroundColor Cyan
