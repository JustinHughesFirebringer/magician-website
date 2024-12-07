# Fix Node.js installation script
Write-Host "Fixing Node.js installation..." -ForegroundColor Green

# Create npm configuration directory if it doesn't exist
$npmConfigDir = "$env:USERPROFILE\.npm"
if (-not (Test-Path $npmConfigDir)) {
    New-Item -ItemType Directory -Path $npmConfigDir -Force
}

# Set npm prefix to the correct location
$npmPrefix = "C:\Users\bigre\AppData\Roaming\npm"
if (-not (Test-Path $npmPrefix)) {
    New-Item -ItemType Directory -Path $npmPrefix -Force
}

# Create a new .npmrc file
$npmrcContent = @"
prefix=$npmPrefix
cache=$env:USERPROFILE\.npm
"@

Set-Content -Path "$env:USERPROFILE\.npmrc" -Value $npmrcContent

# Install npm globally
Write-Host "Installing npm globally..." -ForegroundColor Green
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

# Download and install latest npm
$tempFile = "$env:TEMP\npm.ps1"
Invoke-WebRequest -Uri https://www.npmjs.com/install.ps1 -OutFile $tempFile
& $tempFile

Write-Host "Node.js environment has been fixed. Please restart your terminal." -ForegroundColor Green
