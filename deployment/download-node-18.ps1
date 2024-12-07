# Download Node.js v18.17.0
$nodeUrl = "https://nodejs.org/download/release/v18.17.0/node-v18.17.0-x64.msi"
$installerPath = "$env:USERPROFILE\Downloads\node-v18.17.0-x64.msi"

Write-Host "Downloading Node.js v18.17.0..."
Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath

Write-Host @"

Node.js installer has been downloaded to:
$installerPath

Please:
1. Navigate to your Downloads folder
2. Right-click 'node-v18.17.0-x64.msi'
3. Select 'Run as administrator'
4. Follow the installation steps
5. After installation, open a new PowerShell window and verify with:
   node --version
   npm --version

"@ -ForegroundColor Green
