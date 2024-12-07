# Repair Node.js installation
Write-Host "Repairing Node.js installation..." -ForegroundColor Green

# First, uninstall Node.js
Write-Host "Removing existing Node.js installation..."
$uninstallKeys = Get-ChildItem -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall, HKLM:\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall |
    Get-ItemProperty |
    Where-Object { $_.DisplayName -like "*Node.js*" }

if ($uninstallKeys) {
    foreach ($key in $uninstallKeys) {
        $uninstallString = $key.UninstallString
        if ($uninstallString) {
            $uninstallString = $uninstallString -replace "msiexec.exe", "" -replace "/I", "/X" -replace "/i", "/X"
            Start-Process "msiexec.exe" -ArgumentList "$uninstallString /quiet" -Wait
        }
    }
}

# Download Node.js LTS
Write-Host "Downloading Node.js LTS..."
$nodeUrl = "https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi"
$installerPath = "$env:TEMP\node-installer.msi"
Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath

# Install Node.js
Write-Host "Installing Node.js..."
Start-Process msiexec.exe -Wait -ArgumentList "/i `"$installerPath`" /quiet ADDLOCAL=ALL"

# Clean up
Remove-Item $installerPath -Force

Write-Host @"

Node.js has been repaired. Please:
1. Close all PowerShell/Command Prompt windows
2. Open a new PowerShell window
3. Run these commands to verify:
   node --version
   npm --version

"@ -ForegroundColor Green
