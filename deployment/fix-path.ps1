# Fix PATH for Node.js
$nodePaths = @(
    "C:\Program Files\nodejs",
    "C:\Program Files (x86)\nodejs",
    "$env:APPDATA\npm"
)

# Check if Node.js is installed in any of these locations
$nodeInstallPath = $null
foreach ($path in $nodePaths) {
    if (Test-Path "$path\node.exe") {
        $nodeInstallPath = $path
        break
    }
}

if ($nodeInstallPath) {
    Write-Host "Found Node.js in: $nodeInstallPath"
} else {
    Write-Host "Node.js installation not found in common locations. Checking entire Program Files..."
    $nodeExe = Get-ChildItem -Path "C:\Program Files" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq "node.exe" } | Select-Object -First 1
    if ($nodeExe) {
        $nodeInstallPath = $nodeExe.Directory.FullName
        Write-Host "Found Node.js in: $nodeInstallPath"
    }
}

if ($nodeInstallPath) {
    # Add to both User and Machine PATH
    $userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    $machinePath = [Environment]::GetEnvironmentVariable("PATH", "Machine")

    # Add Node.js path if not already present
    if (-not $userPath.Contains($nodeInstallPath)) {
        [Environment]::SetEnvironmentVariable("PATH", "$userPath;$nodeInstallPath", "User")
        Write-Host "Added Node.js to User PATH"
    }

    if (-not $machinePath.Contains($nodeInstallPath)) {
        [Environment]::SetEnvironmentVariable("PATH", "$machinePath;$nodeInstallPath", "Machine")
        Write-Host "Added Node.js to Machine PATH"
    }

    # Add npm global path
    $npmPath = "$env:APPDATA\npm"
    if (-not (Test-Path $npmPath)) {
        New-Item -ItemType Directory -Path $npmPath -Force | Out-Null
    }
    if (-not $userPath.Contains($npmPath)) {
        [Environment]::SetEnvironmentVariable("PATH", "$userPath;$npmPath", "User")
        Write-Host "Added npm global path to User PATH"
    }

    Write-Host @"

PATH has been updated. Please:
1. Close all PowerShell/Command Prompt windows
2. Open a new PowerShell window as administrator
3. Run these commands to verify:
   node --version
   npm --version

"@ -ForegroundColor Green
} else {
    Write-Host @"

Node.js installation not found. Please:
1. Download Node.js from: https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi
2. Run the installer
3. During installation, make sure 'Add to PATH' is checked
4. After installation, run this script again

"@ -ForegroundColor Yellow
}
