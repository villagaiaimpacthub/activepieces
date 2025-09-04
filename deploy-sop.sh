#!/bin/bash

# ActivePieces SOP Tool - Deployment Script
# Automated setup and deployment for production environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="docker-compose.sop.yml"
ENV_FILE=".env"
ENV_EXAMPLE=".env.sop.example"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
        exit 1
    fi
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    local requirements_met=true
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
        requirements_met=false
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
        requirements_met=false
    fi
    
    # Check available disk space (at least 2GB)
    local available_space=$(df . | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 2097152 ]]; then
        warn "Less than 2GB of free disk space available. Consider freeing up space."
    fi
    
    # Check available memory (at least 2GB)
    local available_memory=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    if [[ $available_memory -lt 2048 ]]; then
        warn "Less than 2GB of available memory. Performance may be impacted."
    fi
    
    if [[ $requirements_met == false ]]; then
        error "System requirements not met. Please address the issues above."
        exit 1
    fi
    
    log "System requirements check passed"
}

# Generate secure random strings
generate_secret() {
    local length=${1:-32}
    openssl rand -hex $length 2>/dev/null || head -c $length /dev/urandom | xxd -p | tr -d '\n'
}

# Setup environment configuration
setup_environment() {
    log "Setting up environment configuration..."
    
    if [[ -f "$ENV_FILE" ]]; then
        info "Environment file already exists. Backing up existing file..."
        cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Copy example environment file
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    
    # Generate secure keys
    log "Generating secure keys..."
    local api_key=$(generate_secret 32)
    local encryption_key=$(generate_secret 32)
    local jwt_secret=$(generate_secret 64)
    local postgres_password=$(generate_secret 16)
    local webhook_secret=$(generate_secret 24)
    
    # Update environment file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|AP_API_KEY=|AP_API_KEY=${api_key}|g" "$ENV_FILE"
        sed -i '' "s|AP_ENCRYPTION_KEY=|AP_ENCRYPTION_KEY=${encryption_key}|g" "$ENV_FILE"
        sed -i '' "s|AP_JWT_SECRET=|AP_JWT_SECRET=${jwt_secret}|g" "$ENV_FILE"
        sed -i '' "s|AP_POSTGRES_PASSWORD=|AP_POSTGRES_PASSWORD=${postgres_password}|g" "$ENV_FILE"
        sed -i '' "s|SOP_WEBHOOK_SECRET=your_webhook_secret|SOP_WEBHOOK_SECRET=${webhook_secret}|g" "$ENV_FILE"
    else
        # Linux
        sed -i "s|AP_API_KEY=|AP_API_KEY=${api_key}|g" "$ENV_FILE"
        sed -i "s|AP_ENCRYPTION_KEY=|AP_ENCRYPTION_KEY=${encryption_key}|g" "$ENV_FILE"
        sed -i "s|AP_JWT_SECRET=|AP_JWT_SECRET=${jwt_secret}|g" "$ENV_FILE"
        sed -i "s|AP_POSTGRES_PASSWORD=|AP_POSTGRES_PASSWORD=${postgres_password}|g" "$ENV_FILE"
        sed -i "s|SOP_WEBHOOK_SECRET=your_webhook_secret|SOP_WEBHOOK_SECRET=${webhook_secret}|g" "$ENV_FILE"
    fi
    
    log "Environment configuration completed"
    info "Generated keys have been saved to $ENV_FILE"
    warn "Keep your $ENV_FILE secure and never commit it to version control!"
}

# Create necessary directories
setup_directories() {
    log "Creating necessary directories..."
    
    mkdir -p docker/nginx
    mkdir -p docker/prometheus  
    mkdir -p docker/grafana/dashboards
    mkdir -p docker/grafana/datasources
    mkdir -p docker/backup
    mkdir -p logs
    mkdir -p uploads/sop
    mkdir -p backups/sop
    
    # Set appropriate permissions
    chmod 755 docker/nginx docker/prometheus docker/grafana
    chmod 755 logs uploads backups
    chmod 755 uploads/sop backups/sop
    
    log "Directory structure created"
}

# Create Nginx configuration
setup_nginx() {
    log "Setting up Nginx configuration..."
    
    cat > docker/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;
    
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    include /etc/nginx/conf.d/*.conf;
}
EOF

    cat > docker/nginx/default.conf << 'EOF'
upstream api {
    server api:3000;
}

server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Frontend static files
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # WebSocket support for real-time features
    location /ws {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check
    location /health {
        proxy_pass http://api/health;
        access_log off;
    }
}
EOF

    log "Nginx configuration created"
}

# Setup monitoring configuration
setup_monitoring() {
    log "Setting up monitoring configuration..."
    
    cat > docker/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'activepieces-sop-api'
    static_configs:
      - targets: ['api:9090']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgresql'
    static_configs:
      - targets: ['postgres:5432']
    metrics_path: '/metrics'

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    metrics_path: '/metrics'
EOF

    mkdir -p docker/grafana/dashboards
    mkdir -p docker/grafana/datasources
    
    cat > docker/grafana/datasources/prometheus.yml << 'EOF'
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

    log "Monitoring configuration created"
}

# Setup backup script
setup_backup() {
    log "Setting up backup configuration..."
    
    cat > docker/backup/backup.sh << 'EOF'
#!/bin/sh

# ActivePieces SOP Database Backup Script
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="${AP_POSTGRES_DATABASE:-activepieces_sop}"
DB_USER="${AP_POSTGRES_USERNAME:-postgres}"
DB_HOST="postgres"

# Create backup
echo "Starting backup at $(date)"
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_DIR/sop_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/sop_backup_$DATE.sql

# Clean up old backups (keep last 30 days)
find $BACKUP_DIR -name "sop_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed at $(date)"
EOF

    chmod +x docker/backup/backup.sh
    log "Backup configuration created"
}

# Build and start services
deploy() {
    log "Building and starting ActivePieces SOP Tool..."
    
    # Build the application
    info "Building Docker images..."
    docker-compose -f "$COMPOSE_FILE" build
    
    # Start the services
    info "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be ready
    log "Waiting for services to start..."
    sleep 30
    
    # Check service health
    check_health
}

# Check service health
check_health() {
    log "Checking service health..."
    
    local services=("postgres" "redis" "api" "frontend")
    local healthy_services=0
    
    for service in "${services[@]}"; do
        if docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "Up"; then
            info "✓ $service is running"
            ((healthy_services++))
        else
            error "✗ $service is not running"
        fi
    done
    
    if [[ $healthy_services -eq ${#services[@]} ]]; then
        log "All services are healthy!"
        return 0
    else
        error "Some services are not healthy. Check the logs with: docker-compose -f $COMPOSE_FILE logs"
        return 1
    fi
}

# Display deployment information
show_info() {
    log "Deployment completed successfully!"
    
    echo ""
    echo "🎉 ActivePieces SOP Tool is now running!"
    echo ""
    echo "📊 Dashboard URL: http://localhost:8080"
    echo "🔧 API URL: http://localhost:3000"
    echo "📈 Metrics: http://localhost:9090 (Prometheus)"
    echo "📊 Monitoring: http://localhost:3001 (Grafana - if monitoring profile enabled)"
    echo ""
    echo "🔑 Important:"
    echo "   - Your secure keys are saved in .env"
    echo "   - Keep .env file secure and never commit it to version control"
    echo "   - Default Grafana login: admin/admin"
    echo ""
    echo "📝 Useful commands:"
    echo "   - View logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo "   - Stop services: docker-compose -f $COMPOSE_FILE down"
    echo "   - Update: docker-compose -f $COMPOSE_FILE pull && docker-compose -f $COMPOSE_FILE up -d"
    echo "   - Backup: docker-compose -f $COMPOSE_FILE exec postgres pg_dump -U postgres activepieces_sop > backup.sql"
    echo ""
}

# Main deployment function
main() {
    echo "🚀 ActivePieces SOP Tool Deployment Script"
    echo "==========================================="
    
    check_root
    check_requirements
    setup_environment
    setup_directories
    setup_nginx
    setup_monitoring
    setup_backup
    
    # Ask user about monitoring
    echo ""
    read -p "Enable monitoring with Prometheus and Grafana? (y/N): " enable_monitoring
    if [[ $enable_monitoring =~ ^[Yy]$ ]]; then
        export COMPOSE_PROFILES="monitoring"
        info "Monitoring will be enabled"
    fi
    
    # Ask user about backup
    echo ""
    read -p "Enable automated backups? (y/N): " enable_backup
    if [[ $enable_backup =~ ^[Yy]$ ]]; then
        export COMPOSE_PROFILES="${COMPOSE_PROFILES:+$COMPOSE_PROFILES,}backup"
        info "Automated backups will be enabled"
    fi
    
    deploy
    show_info
}

# Handle script arguments
case "$1" in
    "setup")
        setup_environment
        setup_directories
        setup_nginx
        setup_monitoring
        setup_backup
        log "Setup completed. Run './deploy-sop.sh' to deploy."
        ;;
    "build")
        docker-compose -f "$COMPOSE_FILE" build
        ;;
    "start")
        docker-compose -f "$COMPOSE_FILE" up -d
        check_health
        ;;
    "stop")
        docker-compose -f "$COMPOSE_FILE" down
        ;;
    "restart")
        docker-compose -f "$COMPOSE_FILE" restart
        check_health
        ;;
    "logs")
        docker-compose -f "$COMPOSE_FILE" logs -f "${2:-}"
        ;;
    "health")
        check_health
        ;;
    "backup")
        docker-compose -f "$COMPOSE_FILE" exec postgres pg_dump -U postgres activepieces_sop > "backup_$(date +%Y%m%d_%H%M%S).sql"
        log "Manual backup created"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  setup    - Setup configuration files only"
        echo "  build    - Build Docker images"
        echo "  start    - Start all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - View logs (optionally specify service)"
        echo "  health   - Check service health"
        echo "  backup   - Create manual database backup"
        echo "  help     - Show this help message"
        echo ""
        echo "Run without arguments to perform complete deployment."
        ;;
    *)
        main
        ;;
esac