# Deploy website script
$ErrorActionPreference = "Stop"

# Set PATH to include Node.js
$env:Path = "C:\nodejs;$env:Path"

Write-Host "Building website..." -ForegroundColor Green
npm run build

Write-Host "Creating deployment directory on server..." -ForegroundColor Green
ssh magician-site "mkdir -p /home/mentallyhyp/public_html"

Write-Host "Deploying files..." -ForegroundColor Green
scp -r .next/* magician-site:/home/mentallyhyp/public_html/
scp package.json package-lock.json magician-site:/home/mentallyhyp/public_html/

Write-Host "Installing dependencies on server..." -ForegroundColor Green
ssh magician-site "cd /home/mentallyhyp/public_html && npm install --production"

Write-Host "Starting the application..." -ForegroundColor Green
ssh magician-site "cd /home/mentallyhyp/public_html && npm start"

Write-Host @"

Website has been deployed! You can access it at:
https://magiciannearme.store

Press Enter to exit...
"@ -ForegroundColor Green

Read-Host
