# Function to update imports in a file
function Update-Imports {
    param (
        [string]$filePath
    )
    
    $content = Get-Content $filePath -Raw
    
    # Update relative imports to use @/ prefix
    $content = $content -replace "from '\.\./(components|types|lib)/", "from '@/$1/"
    $content = $content -replace "from '\.\./\.\./types/", "from '@/types/"
    $content = $content -replace "from '\.\./\.\./lib/", "from '@/lib/"
    $content = $content -replace "from '\.\./\.\./components/", "from '@/components/"
    
    Set-Content -Path $filePath -Value $content
}

# Get all TypeScript/TSX files
$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx"

foreach ($file in $files) {
    Write-Host "Updating imports in $($file.FullName)"
    Update-Imports -filePath $file.FullName
}

Write-Host "Import updates complete. Please review the changes."
