# Self-elevate the script if required
if (-Not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) {
    if ([int](Get-CimInstance -Class Win32_OperatingSystem | Select-Object -ExpandProperty BuildNumber) -ge 6000) {
        $CommandLine = "-File `"" + $MyInvocation.MyCommand.Path + "`""
        Start-Process -FilePath PowerShell.exe -Verb Runas -ArgumentList $CommandLine
        Exit
    }
}

$installerPath = "$env:USERPROFILE\Downloads\node-v18.17.0-x64.msi"

if (Test-Path $installerPath) {
    Write-Host "Installing Node.js v18.17.0..."
    Start-Process msiexec.exe -Wait -ArgumentList "/i `"$installerPath`" /qn ADDLOCAL=ALL"
    Write-Host "Installation complete!"
} else {
    Write-Host "Installer not found. Downloading..."
    $nodeUrl = "https://nodejs.org/download/release/v18.17.0/node-v18.17.0-x64.msi"
    Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath
    Write-Host "Installing Node.js v18.17.0..."
    Start-Process msiexec.exe -Wait -ArgumentList "/i `"$installerPath`" /qn ADDLOCAL=ALL"
    Write-Host "Installation complete!"
}

Write-Host @"

Node.js has been installed. Please:
1. Close all PowerShell windows
2. Open a new PowerShell window
3. Run these commands to verify:
   node --version
   npm --version

Press Enter to continue...
"@

Read-Host
