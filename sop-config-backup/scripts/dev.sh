#!/bin/bash

# Development Server Start Script
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Activepieces SOP Tool Development Environment${NC}"
echo "=========================================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
    else
        echo -e "${YELLOW}⚠️  No .env.example found. Please create .env manually.${NC}"
    fi
fi

# Check if Docker is running
if ! docker info &> /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Starting without database...${NC}"
    echo -e "${YELLOW}   To use database features, please start Docker and run:${NC}"
    echo -e "${YELLOW}   cd docker && docker-compose up -d${NC}"
    START_WITHOUT_DB=true
else
    echo -e "${GREEN}✅ Docker is running${NC}"
    START_WITHOUT_DB=false
fi

# Start Docker services if available
if [ "$START_WITHOUT_DB" = false ]; then
    echo -e "${BLUE}🐳 Starting Docker services...${NC}"
    cd docker
    docker-compose up -d postgres redis
    
    # Wait for services to be ready
    echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
    sleep 5
    
    # Check if PostgreSQL is ready
    if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
        
        # Run migrations if needed
        cd ..
        echo -e "${BLUE}📋 Checking database migrations...${NC}"
        npm run migrations:run
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database migrations up to date${NC}"
        else
            echo -e "${YELLOW}⚠️  Database migrations failed. Continuing anyway...${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  PostgreSQL not ready. Continuing without database...${NC}"
    fi
    
    cd ..
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Start the development servers
echo -e "${BLUE}🎯 Starting development servers...${NC}"
echo ""
echo -e "${GREEN}Frontend will be available at: http://localhost:4200${NC}"
echo -e "${GREEN}Backend API will be available at: http://localhost:3000${NC}"
echo -e "${GREEN}API Documentation will be available at: http://localhost:3000/api/docs${NC}"

if [ "$START_WITHOUT_DB" = false ]; then
    echo -e "${GREEN}PgAdmin will be available at: http://localhost:5050${NC}"
    echo -e "${GREEN}  - Email: admin@activepieces.com${NC}"
    echo -e "${GREEN}  - Password: admin${NC}"
fi

echo ""
echo -e "${BLUE}Press Ctrl+C to stop all services${NC}"
echo ""

# Start both frontend and backend concurrently
npm run dev