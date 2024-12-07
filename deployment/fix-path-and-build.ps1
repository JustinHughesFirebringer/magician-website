# Set PATH to include Node.js
$env:Path = "C:\nodejs;$env:Path"

# Verify Node.js and npm are available
Write-Host "Node.js version:" -ForegroundColor Green
& node --version
Write-Host "npm version:" -ForegroundColor Green
& npm --version

# Run the build
Write-Host "`nBuilding project..." -ForegroundColor Green
& npm run build
