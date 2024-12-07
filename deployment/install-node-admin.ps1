# Self-elevate the script if required
if (-Not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) {
    if ([int](Get-CimInstance -Class Win32_OperatingSystem | Select-Object -ExpandProperty BuildNumber) -ge 6000) {
        $CommandLine = "-File `"" + $MyInvocation.MyCommand.Path + "`""
        Start-Process -FilePath PowerShell.exe -Verb Runas -ArgumentList $CommandLine
        Exit
    }
}

Write-Host "Installing Node.js..." -ForegroundColor Green

# Download Node.js installer
$nodeVersion = "18.17.0"
$url = "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-x64.msi"
$output = "$env:TEMP\node-v$nodeVersion-x64.msi"

Write-Host "Downloading Node.js $nodeVersion..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $url -OutFile $output

Write-Host "Installing Node.js..."
Start-Process msiexec.exe -Wait -ArgumentList "/i `"$output`" /qn ADDLOCAL=ALL"

# Clean up
Remove-Item $output

Write-Host @"

Node.js installation complete. Please:
1. Close all PowerShell/Command Prompt windows
2. Open a new PowerShell window
3. Run these commands to verify:
   node --version
   npm --version

"@ -ForegroundColor Green

# Keep window open
Read-Host -Prompt "Press Enter to exit"
