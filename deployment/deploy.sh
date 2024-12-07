#!/bin/bash

# Configuration
DEPLOY_DIR="/var/www/magician-website"
BACKUP_DIR="/var/www/backups"
REPO_URL="https://github.com/yourusername/magician-website.git"
BRANCH="main"

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
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Create backup
create_backup() {
    log "Creating backup..."
    BACKUP_NAME="magician-website-$(date +'%Y%m%d_%H%M%S').tar.gz"
    if [ -d "$DEPLOY_DIR" ]; then
        tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$DEPLOY_DIR" .
        log "Backup created: $BACKUP_NAME"
    else
        warning "No existing deployment to backup"
    fi
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check Python version
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    if [[ $(echo "$PYTHON_VERSION 3.8" | awk '{print ($1 < $2)}') -eq 1 ]]; then
        error "Python version must be 3.8 or higher. Current version: $PYTHON_VERSION"
        exit 1
    }
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is required but not installed"
        exit 1
    fi
    
    # Check nginx
    if ! command -v nginx &> /dev/null; then
        error "nginx is required but not installed"
        exit 1
    }
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Python dependencies
    python3 -m pip install -r requirements.txt
    
    # Node.js dependencies
    if [ -f "package.json" ]; then
        npm install
    fi
}

# Build the website
build_website() {
    log "Building website..."
    
    # Run the build script
    python3 src/main.py
    
    if [ $? -ne 0 ]; then
        error "Website build failed"
        exit 1
    fi
}

# Configure nginx
configure_nginx() {
    log "Configuring nginx..."
    
    # Copy nginx configuration
    sudo cp deployment/nginx.conf /etc/nginx/conf.d/magician-website.conf
    
    # Test nginx configuration
    sudo nginx -t
    
    if [ $? -ne 0 ]; then
        error "nginx configuration test failed"
        exit 1
    }
    
    # Reload nginx
    sudo systemctl reload nginx
}

# Deploy the website
deploy() {
    log "Starting deployment..."
    
    # Create directories if they don't exist
    mkdir -p "$DEPLOY_DIR" "$BACKUP_DIR"
    
    # Create backup of existing deployment
    create_backup
    
    # Check requirements
    check_requirements
    
    # Clone/update repository
    if [ -d "$DEPLOY_DIR/.git" ]; then
        log "Updating existing repository..."
        cd "$DEPLOY_DIR"
        git fetch origin
        git reset --hard "origin/$BRANCH"
    else
        log "Cloning repository..."
        git clone -b "$BRANCH" "$REPO_URL" "$DEPLOY_DIR"
        cd "$DEPLOY_DIR"
    fi
    
    # Install dependencies
    install_dependencies
    
    # Build website
    build_website
    
    # Configure nginx
    configure_nginx
    
    # Set permissions
    sudo chown -R nginx:nginx "$DEPLOY_DIR"
    sudo chmod -R 755 "$DEPLOY_DIR"
    
    log "Deployment completed successfully!"
}

# Rollback function
rollback() {
    log "Rolling back to previous version..."
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -n1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup found to rollback to"
        exit 1
    }
    
    # Extract backup
    tar -xzf "$BACKUP_DIR/$LATEST_BACKUP" -C "$DEPLOY_DIR"
    
    # Configure nginx
    configure_nginx
    
    log "Rollback completed successfully!"
}

# Main execution
case "$1" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    *)
        echo "Usage: $0 {deploy|rollback}"
        exit 1
        ;;
esac
