# Fix npm installation
Write-Host "Fixing npm installation..." -ForegroundColor Green

# Create necessary directories
$npmDir = "$env:APPDATA\npm"
$npmCacheDir = "$env:APPDATA\npm-cache"
$nodeModulesDir = "C:\Program Files\nodejs\node_modules"

# Create directories if they don't exist
@($npmDir, $npmCacheDir, $nodeModulesDir) | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
        Write-Host "Created directory: $_"
    }
}

# Download npm
Write-Host "Downloading npm..."
$npmUrl = "https://registry.npmjs.org/npm/-/npm-10.2.5.tgz"
$npmTarPath = "$env:TEMP\npm.tgz"
Invoke-WebRequest -Uri $npmUrl -OutFile $npmTarPath

# Extract npm
Write-Host "Extracting npm..."
tar -xf $npmTarPath -C "$env:TEMP"

# Copy npm files
Write-Host "Installing npm..."
Copy-Item "$env:TEMP\package\*" -Destination "C:\Program Files\nodejs\node_modules\npm" -Recurse -Force

# Create npm.cmd
$npmCmd = @"
@ECHO off
SETLOCAL
SET "NODE_EXE=node.exe"
SET "NPM_PREFIX=%APPDATA%\npm"
SET "NPM_JS_PATH=%~dp0\node_modules\npm\bin\npm-cli.js"
"%NODE_EXE%" "%NPM_JS_PATH%" %*
"@

Set-Content -Path "C:\Program Files\nodejs\npm.cmd" -Value $npmCmd

# Clean up
Remove-Item $npmTarPath -Force
Remove-Item "$env:TEMP\package" -Recurse -Force

Write-Host @"

npm has been reinstalled. Please:
1. Close all PowerShell/Command Prompt windows
2. Open a new PowerShell window
3. Run these commands to verify:
   npm --version

"@ -ForegroundColor Green
