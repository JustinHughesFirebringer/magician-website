# Download Node.js LTS
$nodeVersion = "20.10.0"
$downloadUrl = "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-x64.msi"
$installerPath = "$env:TEMP\node-installer.msi"

Write-Host "Downloading Node.js $nodeVersion..."
Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath

Write-Host "Installing Node.js..."
Start-Process msiexec.exe -Wait -ArgumentList "/i `"$installerPath`" /quiet"

Write-Host "Cleaning up..."
Remove-Item $installerPath

Write-Host "Node.js installation complete. Please restart your terminal."
