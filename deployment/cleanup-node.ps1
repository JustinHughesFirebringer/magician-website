# Complete Node.js cleanup script
Write-Host "Cleaning up Node.js installation..." -ForegroundColor Yellow

# Stop any running node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove Node.js directories
$dirsToRemove = @(
    "C:\Program Files\nodejs",
    "C:\Program Files (x86)\nodejs",
    "$env:USERPROFILE\AppData\Roaming\npm",
    "$env:USERPROFILE\AppData\Roaming\npm-cache",
    "$env:USERPROFILE\.node-gyp",
    "$env:USERPROFILE\.npm"
)

foreach ($dir in $dirsToRemove) {
    if (Test-Path $dir) {
        Write-Host "Removing $dir"
        Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Remove Node.js from PATH
$userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$machinePath = [Environment]::GetEnvironmentVariable("PATH", "Machine")

$pathsToRemove = @(
    "C:\Program Files\nodejs\\",
    "C:\Program Files (x86)\nodejs\\",
    "$env:USERPROFILE\AppData\Roaming\npm"
)

foreach ($pathToRemove in $pathsToRemove) {
    $userPath = ($userPath -split ';' | Where-Object { $_ -notlike "*$pathToRemove*" }) -join ';'
    $machinePath = ($machinePath -split ';' | Where-Object { $_ -notlike "*$pathToRemove*" }) -join ';'
}

[Environment]::SetEnvironmentVariable("PATH", $userPath, "User")
[Environment]::SetEnvironmentVariable("PATH", $machinePath, "Machine")

Write-Host @"

Node.js has been completely removed. Please:
1. Download Node.js v18.17.0 LTS from this link:
   https://nodejs.org/download/release/v18.17.0/node-v18.17.0-x64.msi

2. Run the installer with these steps:
   - Right-click the downloaded .msi file
   - Select 'Run as administrator'
   - Click 'Next'
   - Accept the license agreement
   - Click 'Next'
   - Make sure the npm package manager is selected
   - Click 'Next'
   - Check 'Automatically install the necessary tools'
   - Click 'Next'
   - Click 'Install'

3. After installation completes:
   - Close all PowerShell/Command Prompt windows
   - Open a new PowerShell window as administrator
   - Run: node --version
   - Run: npm --version

"@ -ForegroundColor Green

# Keep window open
Read-Host -Prompt "Press Enter to exit"
