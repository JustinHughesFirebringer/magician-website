# Create src/lib/hooks if it doesn't exist
New-Item -ItemType Directory -Force -Path "src/lib/hooks"

# Move hooks
Move-Item -Force "lib/hooks/useDebounce.ts" "src/lib/hooks/"

# Move db directory content if it exists and isn't already in src/lib/db
if (Test-Path "lib/db") {
    Get-ChildItem "lib/db" | ForEach-Object {
        if (-not (Test-Path "src/lib/db/$($_.Name)")) {
            Move-Item -Force $_.FullName "src/lib/db/"
        }
    }
}

# Remove empty directories
Remove-Item -Force -Recurse "lib/hooks" -ErrorAction SilentlyContinue
Remove-Item -Force -Recurse "lib/db" -ErrorAction SilentlyContinue
Remove-Item -Force -Recurse "lib/supabase" -ErrorAction SilentlyContinue
Remove-Item -Force "lib" -ErrorAction SilentlyContinue
