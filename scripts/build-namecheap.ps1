# Clean previous builds
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}
if (Test-Path "out") {
    Remove-Item -Recurse -Force "out"
}

# Install dependencies
npm install

# Build for production
npm run build

# Copy necessary files to out directory
Copy-Item -Path ".env.production" -Destination "out/.env" -ErrorAction SilentlyContinue
Copy-Item -Path "public/*" -Destination "out/" -Recurse -Force

Write-Host "Build completed! The static files are in the 'out' directory."
Write-Host "Upload the contents of the 'out' directory to your Namecheap hosting."
