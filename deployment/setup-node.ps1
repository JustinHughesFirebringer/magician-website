# Setup Node.js script
$ErrorActionPreference = "Stop"

Write-Host "Setting up Node.js..." -ForegroundColor Green

# Download Node.js LTS installer
$nodeUrl = "https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi"
$installerPath = "$env:TEMP\node-installer.msi"

Write-Host "Downloading Node.js installer..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath

# Install Node.js
Write-Host "Installing Node.js..."
$arguments = "/i `"$installerPath`" /quiet ADDLOCAL=ALL"
Start-Process msiexec.exe -ArgumentList $arguments -Wait

# Remove installer
Remove-Item $installerPath -Force

# Update Path environment variable
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Installation complete. Testing Node.js and npm..."
try {
    $nodeVersion = & node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
    
    $npmVersion = & npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
    
    Write-Host "Setup completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error testing installation: $_" -ForegroundColor Red
    exit 1
}
