#!/bin/bash

# Configuration
DEPLOY_DIR="/home/mentallyhyp/public_html"
BACKUP_DIR="/home/mentallyhyp/backups"
APP_NAME="magician-website"
NODE_VERSION="18.19.0"
DOMAIN="magiciannearme.store"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Create backup of existing files
create_backup() {
    log "Creating backup..."
    if [ -d "$DEPLOY_DIR" ]; then
        BACKUP_NAME="$APP_NAME-$(date +'%Y%m%d_%H%M%S').tar.gz"
        mkdir -p "$BACKUP_DIR"
        tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$DEPLOY_DIR" .
        log "Backup created: $BACKUP_NAME"
    else
        warning "No existing deployment to backup"
        mkdir -p "$DEPLOY_DIR"
    fi
}

# Check and install Node.js
setup_nodejs() {
    log "Setting up Node.js..."
    
    # Check if nvm is installed
    if [ ! -f "$HOME/.nvm/nvm.sh" ]; then
        log "Installing nvm..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    # Install Node.js
    log "Installing Node.js $NODE_VERSION..."
    nvm install $NODE_VERSION
    nvm use $NODE_VERSION
    
    # Verify installation
    node -v || error "Failed to install Node.js"
    npm -v || error "Failed to install npm"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    cd "$DEPLOY_DIR" || error "Failed to change to deployment directory"
    npm ci || error "Failed to install dependencies"
}

# Build the application
build_app() {
    log "Building the application..."
    cd "$DEPLOY_DIR" || error "Failed to change to deployment directory"
    npm run build || error "Failed to build the application"
}

# Configure environment
setup_env() {
    log "Setting up environment variables..."
    if [ ! -f ".env" ]; then
        error "Missing .env file"
    fi
}

# Deploy the application
deploy() {
    log "Starting deployment..."
    
    # Create backup
    create_backup
    
    # Clear deployment directory
    rm -rf "$DEPLOY_DIR"/*
    
    # Copy files
    cp -r .next "$DEPLOY_DIR/"
    cp -r public "$DEPLOY_DIR/"
    cp -r node_modules "$DEPLOY_DIR/"
    cp package.json "$DEPLOY_DIR/"
    cp .env "$DEPLOY_DIR/"
    cp deployment/ecosystem.config.js "$DEPLOY_DIR/"
    
    # Set permissions
    chmod -R 755 "$DEPLOY_DIR"
    
    log "Deployment completed successfully"
}

# Setup PM2
setup_pm2() {
    log "Setting up PM2..."
    npm install -g pm2 || error "Failed to install PM2"
    
    cd "$DEPLOY_DIR" || error "Failed to change to deployment directory"
    
    # Stop existing PM2 process if it exists
    pm2 stop magician-website || true
    pm2 delete magician-website || true
    
    # Start new PM2 process
    pm2 start ecosystem.config.js || error "Failed to start PM2 process"
    pm2 save || error "Failed to save PM2 configuration"
    
    log "PM2 setup completed"
}

# Main execution
main() {
    log "Starting deployment process for $APP_NAME to $DOMAIN..."
    
    # Navigate to project directory
    cd "$(dirname "$0")/.." || error "Failed to navigate to project directory"
    
    setup_env
    setup_nodejs
    install_dependencies
    build_app
    deploy
    setup_pm2
    
    log "Deployment completed successfully!"
    log "Your website should now be accessible at https://$DOMAIN"
}

# Run the script
main
