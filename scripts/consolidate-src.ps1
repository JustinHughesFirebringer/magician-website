# Create necessary directories if they don't exist
New-Item -ItemType Directory -Force -Path "src/app"
New-Item -ItemType Directory -Force -Path "src/components"
New-Item -ItemType Directory -Force -Path "src/types"

# Move app directory content
Get-ChildItem "app" | ForEach-Object {
    if (-not (Test-Path "src/app/$($_.Name)")) {
        Move-Item -Force $_.FullName "src/app/"
    }
}

# Move components directory content
Get-ChildItem "components" | ForEach-Object {
    if (-not (Test-Path "src/components/$($_.Name)")) {
        Move-Item -Force $_.FullName "src/components/"
    }
}

# Move types directory content
Get-ChildItem "types" | ForEach-Object {
    if (-not (Test-Path "src/types/$($_.Name)")) {
        Move-Item -Force $_.FullName "src/types/"
    }
}

# Remove empty directories
Remove-Item -Force -Recurse "app" -ErrorAction SilentlyContinue
Remove-Item -Force -Recurse "components" -ErrorAction SilentlyContinue
Remove-Item -Force -Recurse "types" -ErrorAction SilentlyContinue

# Update tsconfig.json paths
$tsconfig = Get-Content "tsconfig.json" | ConvertFrom-Json
$tsconfig.compilerOptions.paths = @{
    "@/*" = @("./src/*")
}
$tsconfig | ConvertTo-Json -Depth 10 | Set-Content "tsconfig.json"

Write-Host "Consolidation complete. Please review the changes and update imports as needed."
