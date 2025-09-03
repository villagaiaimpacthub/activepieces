#!/bin/bash

# Database Reset Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗃️  Database Reset Script${NC}"
echo "========================"

# Check if Docker is running
if ! docker info &> /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Function to ask for confirmation
confirm() {
    read -p "$(echo -e ${YELLOW}$1${NC}) [y/N]: " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

echo -e "${YELLOW}⚠️  WARNING: This will completely reset the database and remove all data!${NC}"
if ! confirm "Are you sure you want to continue?"; then
    echo -e "${BLUE}Operation cancelled.${NC}"
    exit 0
fi

# Navigate to docker directory
cd docker

echo -e "${BLUE}🛑 Stopping database container...${NC}"
docker-compose stop postgres

echo -e "${BLUE}🗑️  Removing database container and volume...${NC}"
docker-compose rm -f postgres
docker volume rm $(docker volume ls -q | grep postgres) 2>/dev/null || true

echo -e "${BLUE}🚀 Starting fresh database...${NC}"
docker-compose up -d postgres

echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
timeout 60 bash -c 'until docker-compose exec -T postgres pg_isready -U postgres; do sleep 2; done'

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database failed to start within 60 seconds${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database is ready${NC}"

# Go back to project root
cd ..

echo -e "${BLUE}📋 Running database migrations...${NC}"
npm run migrations:run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database migrations completed successfully${NC}"
else
    echo -e "${RED}❌ Database migrations failed${NC}"
    exit 1
fi

echo -e "${BLUE}🌱 Database seeding (if configured)...${NC}"
# Check if there's a seed script
if grep -q '"seed"' package.json; then
    npm run seed
    echo -e "${GREEN}✅ Database seeded successfully${NC}"
else
    echo -e "${YELLOW}⚠️  No seed script found in package.json${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Database reset completed successfully!${NC}"
echo ""
echo -e "${BLUE}Database is now fresh and ready for development.${NC}"
echo "You can connect to the database using:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: activepieces_sop"
echo "  Username: postgres"
echo "  Password: password"
echo ""
echo "Or use PgAdmin at: http://localhost:5050"
echo "  Email: admin@activepieces.com"
echo "  Password: admin"