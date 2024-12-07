# Reinstall Node.js script
Write-Host "Cleaning up Node.js installation..." -ForegroundColor Green

# Remove existing Node.js installation
$nodePaths = @(
    "C:\Program Files\nodejs",
    "C:\Program Files (x86)\nodejs",
    "$env:USERPROFILE\AppData\Roaming\npm",
    "$env:USERPROFILE\AppData\Roaming\npm-cache",
    "$env:USERPROFILE\.npm"
)

foreach ($path in $nodePaths) {
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force
        Write-Host "Removed $path" -ForegroundColor Yellow
    }
}

Write-Host @"

Node.js has been cleaned up. Please follow these steps:

1. Download Node.js LTS from: https://nodejs.org/
2. Run the installer
3. After installation, open a new PowerShell window and run:
   npm install -g npm@latest

Then return to your project directory and run:
npm install
npm run build

"@ -ForegroundColor Green
