# PowerShell Deployment Script for Magician Website

# Configuration
$DEPLOY_DIR = "/home/mentallyhyp/public_html/magician-website"
$BACKUP_DIR = "/home/mentallyhyp/backups"
$REMOTE_HOST = "magiciannearme.store"
$REMOTE_USER = "mentallyhyp"
$SSH_KEY = "C:\Users\bigre\CascadeProjects\magician-website\deployment\magiciansitebuilder"
$REMOTE_PATH = "${REMOTE_USER}@${REMOTE_HOST}"

# Functions
function Write-Log {
    param($Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR: $Message" -ForegroundColor Red
}

# Check if SSH key exists
if (-not (Test-Path $SSH_KEY)) {
    Write-Error "SSH key not found at $SSH_KEY"
    exit 1
}

# Build the project
Write-Log "Building the project..."
try {
    Set-Location ..
    npm install
    npm run build
} catch {
    Write-Error "Failed to build the project: $_"
    exit 1
}

# Create deployment directory on server
Write-Log "Creating deployment directory..."
ssh -i $SSH_KEY "${REMOTE_PATH}" "mkdir -p ${DEPLOY_DIR}"

# Deploy the files
Write-Log "Deploying files..."
try {
    # Copy the build files
    scp -i $SSH_KEY -r .next/* "${REMOTE_PATH}:${DEPLOY_DIR}/"
    scp -i $SSH_KEY package.json package-lock.json "${REMOTE_PATH}:${DEPLOY_DIR}/"
    
    # Install dependencies on server
    ssh -i $SSH_KEY "${REMOTE_PATH}" "cd ${DEPLOY_DIR} && npm install --production"
    
    Write-Log "Deployment completed successfully!"
} catch {
    Write-Error "Deployment failed: $_"
    exit 1
}
