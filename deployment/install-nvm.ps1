# Download and install NVM for Windows
$nvmUrl = "https://github.com/coreybutler/nvm-windows/releases/download/1.1.11/nvm-setup.exe"
$installerPath = "$env:TEMP\nvm-setup.exe"

Write-Host "Downloading NVM for Windows..."
Invoke-WebRequest -Uri $nvmUrl -OutFile $installerPath

Write-Host "Installing NVM for Windows..."
Start-Process -FilePath $installerPath -ArgumentList "/SILENT" -Wait

Write-Host @"
NVM has been installed. Please:

1. Close this terminal
2. Open a new terminal as administrator
3. Run these commands:
   nvm install 18.17.0
   nvm use 18.17.0
   npm install -g npm@latest

Then return to your project directory and run:
npm install
npm run build
"@
