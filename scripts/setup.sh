#!/bin/bash

# Activepieces SOP Tool Setup Script
set -e

echo "🚀 Setting up Activepieces SOP Tool Development Environment"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js version check passed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_success "npm version: $(npm --version)"

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed. You'll need Docker to run the development database."
    print_warning "Install Docker from: https://docs.docker.com/get-docker/"
    SKIP_DOCKER=true
else
    if ! docker info &> /dev/null; then
        print_warning "Docker is installed but not running. Please start Docker daemon."
        SKIP_DOCKER=true
    else
        print_success "Docker is installed and running"
        SKIP_DOCKER=false
    fi
fi

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install
print_success "Dependencies installed successfully"

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating environment configuration file..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
    else
        print_warning "No .env.example file found. Creating basic .env file..."
        cat > .env << EOL
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=activepieces_sop
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_URL=postgresql://postgres:password@localhost:5432/activepieces_sop

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# Application Configuration
NODE_ENV=development
PORT=3000
JWT_SECRET=development-jwt-secret-key
API_URL=http://localhost:3000

# Logging Configuration
LOG_LEVEL=debug
LOG_FORMAT=simple
LOG_DIR=./logs

# File Upload Configuration
MAX_FILE_SIZE=10MB
UPLOAD_PATH=./uploads
EOL
        print_success "Created basic .env file"
    fi
else
    print_success "Environment file already exists"
fi

# Create logs directory
if [ ! -d "logs" ]; then
    mkdir -p logs
    print_success "Created logs directory"
fi

# Create uploads directory
if [ ! -d "uploads" ]; then
    mkdir -p uploads
    print_success "Created uploads directory"
fi

# Start Docker services if Docker is available
if [ "$SKIP_DOCKER" = false ]; then
    print_status "Starting Docker services..."
    cd docker
    docker-compose up -d postgres redis
    
    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    timeout 60 bash -c 'until docker-compose exec -T postgres pg_isready -U postgres; do sleep 2; done'
    
    if [ $? -eq 0 ]; then
        print_success "PostgreSQL is ready"
    else
        print_error "PostgreSQL failed to start within 60 seconds"
        exit 1
    fi
    
    cd ..
    print_success "Docker services started"
fi

# Run database migrations (if database is available)
if [ "$SKIP_DOCKER" = false ]; then
    print_status "Running database migrations..."
    npm run migrations:run
    if [ $? -eq 0 ]; then
        print_success "Database migrations completed"
    else
        print_warning "Database migrations failed. You may need to run them manually with: npm run migrations:run"
    fi
fi

# Build the application
print_status "Building the application..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Application built successfully"
else
    print_error "Application build failed"
    exit 1
fi

# Run tests
print_status "Running tests..."
npm test
if [ $? -eq 0 ]; then
    print_success "All tests passed"
else
    print_warning "Some tests failed. Check the output above for details."
fi

echo ""
print_success "Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "==============="
echo "1. Review and update the .env file with your configuration"
if [ "$SKIP_DOCKER" = true ]; then
    echo "2. Install and start Docker, then run: cd docker && docker-compose up -d"
    echo "3. Run database migrations: npm run migrations:run"
fi
echo "4. Start the development server: npm run dev"
echo "5. Open your browser to: http://localhost:4200"
echo ""
echo "📚 Useful Commands:"
echo "==================="
echo "• npm run dev          - Start development servers"
echo "• npm run build        - Build the application"
echo "• npm run test         - Run tests"
echo "• npm run lint         - Run linter"
echo "• npm run format       - Format code"
echo ""
echo "🐳 Docker Commands:"
echo "==================="
echo "• cd docker && docker-compose up -d      - Start all services"
echo "• cd docker && docker-compose down       - Stop all services"
echo "• cd docker && docker-compose logs       - View logs"
echo ""
print_success "Happy coding! 🎉"