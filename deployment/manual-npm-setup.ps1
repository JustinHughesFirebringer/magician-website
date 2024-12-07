# Manual npm setup script
$ErrorActionPreference = "Stop"

Write-Host "Setting up npm manually..." -ForegroundColor Green

# Create necessary directories
$nodeModulesDir = "C:\Program Files\nodejs\node_modules"
$npmDir = "$nodeModulesDir\npm"
$npmGlobalDir = "$env:APPDATA\npm"

# Create directories if they don't exist
@($nodeModulesDir, $npmGlobalDir) | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
        Write-Host "Created directory: $_"
    }
}

# Download npm
$npmVersion = "10.2.5"
$npmUrl = "https://registry.npmjs.org/npm/-/npm-$npmVersion.tgz"
$npmTarPath = "$env:TEMP\npm.tgz"
$npmExtractPath = "$env:TEMP\npm-extract"

Write-Host "Downloading npm $npmVersion..."
Invoke-WebRequest -Uri $npmUrl -OutFile $npmTarPath

# Create extraction directory
if (Test-Path $npmExtractPath) {
    Remove-Item $npmExtractPath -Recurse -Force
}
New-Item -ItemType Directory -Path $npmExtractPath -Force | Out-Null

# Extract npm
Write-Host "Extracting npm..."
tar -xf $npmTarPath -C $npmExtractPath

# Copy npm files
Write-Host "Installing npm..."
if (Test-Path $npmDir) {
    Remove-Item $npmDir -Recurse -Force
}
Copy-Item "$npmExtractPath\package" -Destination $npmDir -Recurse

# Create npm.cmd
$npmCmd = @"
@ECHO off
SETLOCAL
SET "NODE_EXE=node.exe"
SET "NPM_PREFIX=%APPDATA%\npm"
SET "NPM_CONFIG_PREFIX=%APPDATA%\npm"
"%NODE_EXE%" "%~dp0\node_modules\npm\bin\npm-cli.js" %*
"@

$npmCmdPath = "C:\Program Files\nodejs\npm.cmd"
Set-Content -Path $npmCmdPath -Value $npmCmd -Encoding ASCII

# Create npmrc file
$npmrcContent = @"
prefix=${env:APPDATA}\npm
"@

Set-Content -Path "$env:USERPROFILE\.npmrc" -Value $npmrcContent -Encoding ASCII

# Clean up
Remove-Item $npmTarPath -Force
Remove-Item $npmExtractPath -Recurse -Force

Write-Host @"

npm has been set up manually. Please:
1. Close ALL PowerShell and Command Prompt windows
2. Open a new PowerShell window as administrator
3. Run these commands to verify:
   npm --version

Press Enter to exit...
"@ -ForegroundColor Green

Read-Host
