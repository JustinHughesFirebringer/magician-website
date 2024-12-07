# Force reinstall Node.js
$ErrorActionPreference = "SilentlyContinue"

Write-Host "Removing existing Node.js installation..." -ForegroundColor Yellow

# Kill any running node processes
Get-Process node | Stop-Process -Force
Get-Process npm | Stop-Process -Force

# Remove Node.js directories
@(
    "C:\Program Files\nodejs",
    "C:\Program Files (x86)\nodejs",
    "$env:USERPROFILE\AppData\Roaming\npm",
    "$env:USERPROFILE\AppData\Roaming\npm-cache",
    "$env:USERPROFILE\.npm"
) | ForEach-Object {
    if (Test-Path $_) {
        Remove-Item $_ -Recurse -Force
    }
}

# Remove from PATH
$paths = [Environment]::GetEnvironmentVariable("PATH", "User") -split ";"
$paths = $paths | Where-Object { $_ -notlike "*nodejs*" -and $_ -notlike "*npm*" }
[Environment]::SetEnvironmentVariable("PATH", ($paths -join ";"), "User")

Write-Host "Installing Node.js v18.17.0..." -ForegroundColor Green

# Download and install Node.js
$nodeUrl = "https://nodejs.org/download/release/v18.17.0/node-v18.17.0-x64.msi"
$installerPath = "$env:TEMP\node-v18.17.0-x64.msi"
Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath

# Install silently
Start-Process msiexec.exe -Wait -ArgumentList "/i `"$installerPath`" /qn ADDLOCAL=ALL"

# Clean up
Remove-Item $installerPath -Force

Write-Host @"

Node.js v18.17.0 has been installed. Please:
1. Close ALL PowerShell and Command Prompt windows
2. Open a new PowerShell window as administrator
3. Run these commands to verify:
   node --version
   npm --version

Press Enter to exit...
"@ -ForegroundColor Green

Read-Host
