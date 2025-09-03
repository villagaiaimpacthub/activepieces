#!/bin/bash

# Clean Development Environment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Cleaning Activepieces SOP Tool Development Environment${NC}"
echo "========================================================="

# Function to ask for confirmation
confirm() {
    read -p "$(echo -e ${YELLOW}$1${NC}) [y/N]: " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# Clean node_modules
if [ -d "node_modules" ] && confirm "Remove node_modules directory?"; then
    echo -e "${BLUE}🗑️  Removing node_modules...${NC}"
    rm -rf node_modules
    echo -e "${GREEN}✅ node_modules removed${NC}"
fi

# Clean build artifacts
if [ -d "dist" ] && confirm "Remove dist directory?"; then
    echo -e "${BLUE}🗑️  Removing build artifacts...${NC}"
    rm -rf dist
    echo -e "${GREEN}✅ Build artifacts removed${NC}"
fi

# Clean Nx cache
if [ -d ".nx" ] && confirm "Remove Nx cache?"; then
    echo -e "${BLUE}🗑️  Removing Nx cache...${NC}"
    rm -rf .nx
    echo -e "${GREEN}✅ Nx cache removed${NC}"
fi

# Clean logs
if [ -d "logs" ] && confirm "Remove log files?"; then
    echo -e "${BLUE}🗑️  Removing log files...${NC}"
    rm -rf logs/*
    echo -e "${GREEN}✅ Log files removed${NC}"
fi

# Clean uploads
if [ -d "uploads" ] && confirm "Remove uploaded files?"; then
    echo -e "${BLUE}🗑️  Removing uploaded files...${NC}"
    rm -rf uploads/*
    echo -e "${GREEN}✅ Uploaded files removed${NC}"
fi

# Clean Docker volumes and containers
if command -v docker &> /dev/null && docker info &> /dev/null 2>&1; then
    if confirm "Stop and remove Docker containers and volumes?"; then
        echo -e "${BLUE}🐳 Stopping Docker services...${NC}"
        cd docker
        docker-compose down -v --remove-orphans
        cd ..
        
        # Remove Docker images if requested
        if confirm "Also remove Docker images (this will require re-downloading)?"; then
            echo -e "${BLUE}🗑️  Removing Docker images...${NC}"
            docker-compose -f docker/docker-compose.yml down --rmi all
        fi
        
        echo -e "${GREEN}✅ Docker cleanup completed${NC}"
    fi
fi

# Clean npm cache
if confirm "Clear npm cache?"; then
    echo -e "${BLUE}🗑️  Clearing npm cache...${NC}"
    npm cache clean --force
    echo -e "${GREEN}✅ npm cache cleared${NC}"
fi

# Clean TypeScript incremental build cache
if [ -f "tsconfig.tsbuildinfo" ]; then
    echo -e "${BLUE}🗑️  Removing TypeScript build cache...${NC}"
    rm -f tsconfig.tsbuildinfo
    echo -e "${GREEN}✅ TypeScript cache removed${NC}"
fi

# Clean Jest cache
if confirm "Clear Jest cache?"; then
    echo -e "${BLUE}🗑️  Clearing Jest cache...${NC}"
    npx jest --clearCache 2>/dev/null || echo -e "${YELLOW}⚠️  Jest not installed, skipping cache clear${NC}"
    echo -e "${GREEN}✅ Jest cache cleared${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Cleanup completed!${NC}"
echo ""
echo -e "${BLUE}To restore the development environment:${NC}"
echo "1. Run: ./scripts/setup.sh"
echo "2. Run: ./scripts/dev.sh"
echo ""