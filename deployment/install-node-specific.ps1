# Install Node.js with specific options
$ErrorActionPreference = "Stop"

Write-Host "Installing Node.js with specific options..." -ForegroundColor Green

# Download Node.js LTS
$nodeVersion = "18.17.0"
$nodeUrl = "https://nodejs.org/download/release/v$nodeVersion/node-v$nodeVersion-x64.msi"
$installerPath = "$env:TEMP\node-v$nodeVersion-x64.msi"

Write-Host "Downloading Node.js $nodeVersion..."
Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath

# Install with specific options
Write-Host "Installing Node.js..."
$arguments = @(
    "/i",
    "`"$installerPath`"",
    "/qn",
    "INSTALLDIR=`"C:\Program Files\nodejs`"",
    "ADDLOCAL=ALL",
    "ADDDEFAULT=IconsAndPaths,NodeRuntime,npm,DocumentationShortcuts,EnvironmentPathNpmModules",
    "/L*V `"$env:TEMP\node-install.log`""
)

Start-Process msiexec.exe -ArgumentList $arguments -Wait -NoNewWindow

# Clean up
Remove-Item $installerPath -Force

Write-Host @"

Node.js installation complete. Please:
1. Close ALL PowerShell and Command Prompt windows
2. Open a new PowerShell window as administrator
3. Run these commands to verify:
   node --version
   npm --version

If you see any errors, you can check the installation log at:
$env:TEMP\node-install.log

Press Enter to exit...
"@ -ForegroundColor Green

Read-Host
