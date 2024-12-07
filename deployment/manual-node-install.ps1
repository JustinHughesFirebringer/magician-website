# Manual Node.js installation from zip
$ErrorActionPreference = "Stop"

Write-Host "Installing Node.js manually from zip..." -ForegroundColor Green

# Define paths
$nodeVersion = "18.17.0"
$nodeUrl = "https://nodejs.org/download/release/v$nodeVersion/node-v$nodeVersion-win-x64.zip"
$downloadPath = "$env:TEMP\node.zip"
$extractPath = "C:\nodejs"
$npmGlobalPath = "$env:APPDATA\npm"

# Remove existing Node.js installation
Write-Host "Removing existing Node.js installation..."
@(
    "C:\Program Files\nodejs",
    "C:\Program Files (x86)\nodejs",
    $extractPath,
    "$env:APPDATA\npm",
    "$env:APPDATA\npm-cache",
    "$env:USERPROFILE\.npm"
) | ForEach-Object {
    if (Test-Path $_) {
        Remove-Item $_ -Recurse -Force
        Write-Host "Removed: $_"
    }
}

# Download Node.js
Write-Host "Downloading Node.js..."
Invoke-WebRequest -Uri $nodeUrl -OutFile $downloadPath

# Create directories
New-Item -ItemType Directory -Force -Path $extractPath | Out-Null
New-Item -ItemType Directory -Force -Path $npmGlobalPath | Out-Null

# Extract Node.js
Write-Host "Extracting Node.js..."
Expand-Archive -Path $downloadPath -DestinationPath $env:TEMP -Force
Move-Item -Path "$env:TEMP\node-v$nodeVersion-win-x64\*" -Destination $extractPath -Force

# Update PATH
Write-Host "Updating PATH..."
$userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$machinePath = [Environment]::GetEnvironmentVariable("PATH", "Machine")

# Remove old Node.js paths
$userPath = ($userPath -split ';' | Where-Object { $_ -notlike "*nodejs*" -and $_ -notlike "*npm*" }) -join ';'
$machinePath = ($machinePath -split ';' | Where-Object { $_ -notlike "*nodejs*" -and $_ -notlike "*npm*" }) -join ';'

# Add new Node.js paths
$userPath = "$extractPath;$npmGlobalPath;$userPath"
[Environment]::SetEnvironmentVariable("PATH", $userPath, "User")

# Create .npmrc
$npmrcContent = @"
prefix=$npmGlobalPath
"@
Set-Content -Path "$env:USERPROFILE\.npmrc" -Value $npmrcContent

# Clean up
Remove-Item $downloadPath -Force
Remove-Item "$env:TEMP\node-v$nodeVersion-win-x64" -Recurse -Force

Write-Host @"

Node.js has been installed manually. Please:
1. Close ALL PowerShell and Command Prompt windows
2. Open a new PowerShell window as administrator
3. Run these commands to verify:
   node --version
   npm --version

The installation is at: $extractPath

Press Enter to exit...
"@ -ForegroundColor Green

Read-Host
