# Installation and Setup

This comprehensive guide covers the installation, configuration, and initial setup of the ActivePieces SOP Tool for system administrators.

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4 GB
- **Storage**: 10 GB available disk space
- **Operating System**: 
  - Linux (Ubuntu 20.04+ recommended)
  - macOS 10.15+
  - Windows 10/11 with WSL2

### Recommended Requirements
- **CPU**: 4+ cores, 2.5+ GHz
- **RAM**: 8+ GB
- **Storage**: 50+ GB SSD
- **Network**: Stable internet connection (for updates and integrations)

### Software Dependencies
- **Docker**: 20.10+ and Docker Compose 2.0+
- **Node.js**: 20+ (for development builds)
- **Git**: For version control and updates
- **OpenSSL**: For key generation

## Pre-Installation Checklist

### Infrastructure Preparation
- [ ] Docker and Docker Compose installed and tested
- [ ] Sufficient disk space available
- [ ] Network ports 3000, 8080, 5432, 6379, 9090 available
- [ ] SSL certificates prepared (for production HTTPS)
- [ ] Backup strategy defined

### Security Considerations
- [ ] Firewall rules configured
- [ ] User accounts and permissions planned
- [ ] Password policies established
- [ ] Data retention policies defined
- [ ] Compliance requirements reviewed

### Business Readiness
- [ ] User roles and permissions mapped
- [ ] Initial user accounts planned
- [ ] SOP categories and templates identified
- [ ] Integration requirements documented

## Installation Methods

### Method 1: Quick Start (Recommended)

This is the fastest way to get up and running with default configurations.

1. **Download the SOP Tool**
   ```bash
   git clone https://github.com/activepieces/activepieces-sop-tool.git
   cd activepieces-sop-tool
   ```

2. **Run the Deployment Script**
   ```bash
   chmod +x deploy-sop.sh
   ./deploy-sop.sh
   ```

3. **Follow Interactive Setup**
   The script will:
   - Check system requirements
   - Generate secure keys automatically
   - Setup environment configuration
   - Create necessary directories
   - Deploy all services
   - Perform health checks

4. **Access the Application**
   - Dashboard: http://localhost:8080
   - API: http://localhost:3000
   - Prometheus: http://localhost:9090 (if monitoring enabled)
   - Grafana: http://localhost:3001 (if monitoring enabled)

### Method 2: Manual Installation

For customized deployments or when you need full control over the process.

#### Step 1: Environment Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/activepieces/activepieces-sop-tool.git
   cd activepieces-sop-tool
   ```

2. **Create Environment File**
   ```bash
   cp .env.sop.example .env
   ```

3. **Generate Security Keys**
   ```bash
   # API Key (32 characters)
   openssl rand -hex 32

   # Encryption Key (32 characters)
   openssl rand -hex 32

   # JWT Secret (64 characters)
   openssl rand -hex 64

   # Database Password (16 characters)
   openssl rand -hex 16
   ```

4. **Update Environment File**
   Edit `.env` and update the generated keys:
   ```bash
   # Security Configuration
   AP_API_KEY=your_generated_api_key
   AP_ENCRYPTION_KEY=your_generated_encryption_key
   AP_JWT_SECRET=your_generated_jwt_secret
   AP_POSTGRES_PASSWORD=your_generated_password
   ```

#### Step 2: Directory Structure

```bash
# Create necessary directories
mkdir -p docker/nginx
mkdir -p docker/prometheus
mkdir -p docker/grafana/dashboards
mkdir -p docker/grafana/datasources
mkdir -p logs
mkdir -p uploads/sop
mkdir -p backups/sop

# Set permissions
chmod 755 docker/nginx docker/prometheus docker/grafana
chmod 755 logs uploads backups
```

#### Step 3: Configuration Files

The deployment script creates these automatically, but for manual setup:

1. **Nginx Configuration** (see deploy-sop.sh for full content)
2. **Prometheus Configuration** (see deploy-sop.sh for full content)  
3. **Grafana Configuration** (see deploy-sop.sh for full content)

#### Step 4: Deploy Services

```bash
# Build and start all services
docker-compose -f docker-compose.sop.yml build
docker-compose -f docker-compose.sop.yml up -d

# Check service status
docker-compose -f docker-compose.sop.yml ps
```

### Method 3: Production Deployment

For production environments with additional security and monitoring.

#### Load Balancer Setup
```nginx
upstream activepieces_api {
    server api1.internal:3000;
    server api2.internal:3000;
}

upstream activepieces_frontend {
    server frontend1.internal:80;
    server frontend2.internal:80;
}

server {
    listen 443 ssl http2;
    server_name sop.company.com;

    ssl_certificate /path/to/ssl.crt;
    ssl_certificate_key /path/to/ssl.key;
    
    location / {
        proxy_pass http://activepieces_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://activepieces_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### High Availability Configuration
```yaml
# docker-compose.production.yml
version: '3.8'

services:
  postgres:
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    volumes:
      - type: volume
        source: postgres_data
        target: /var/lib/postgresql/data
        volume:
          driver: local
          driver_opts:
            type: nfs
            o: addr=nfs.company.com,rw
            device: ":/postgres_data"

  api:
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    environment:
      - AP_POSTGRES_HOST=postgres.company.com
      - AP_REDIS_HOST=redis.company.com
```

## Post-Installation Configuration

### Initial System Setup

1. **Database Migration**
   ```bash
   # Verify database is accessible
   docker-compose -f docker-compose.sop.yml exec postgres psql -U postgres -d activepieces_sop -c "SELECT version();"

   # Run migrations (automatic on first startup)
   docker-compose -f docker-compose.sop.yml logs api | grep migration
   ```

2. **Create Admin User**
   ```bash
   # Access API container
   docker-compose -f docker-compose.sop.yml exec api sh

   # Create first admin user (inside container)
   node scripts/create-admin-user.js \
     --email admin@company.com \
     --password SecurePassword123! \
     --firstName Admin \
     --lastName User
   ```

3. **Verify Installation**
   ```bash
   # Check all services are running
   docker-compose -f docker-compose.sop.yml ps

   # Test API health
   curl -f http://localhost:3000/health

   # Test frontend
   curl -f http://localhost:8080/health
   ```

### Security Hardening

#### 1. Change Default Passwords
- Change Grafana admin password (default: admin/admin)
- Update database passwords if using defaults
- Rotate API keys and JWT secrets

#### 2. Configure Firewall Rules
```bash
# Example iptables rules
iptables -A INPUT -p tcp --dport 8080 -j ACCEPT  # Frontend
iptables -A INPUT -p tcp --dport 3000 -j ACCEPT  # API
iptables -A INPUT -p tcp --dport 22 -j ACCEPT    # SSH
iptables -A INPUT -j DROP  # Drop all other traffic
```

#### 3. SSL/TLS Configuration
For production deployments, configure HTTPS:

```yaml
# docker-compose.ssl.yml
version: '3.8'

services:
  nginx-ssl:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
      - ./nginx-ssl.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api
      - frontend
```

#### 4. Backup Configuration
```bash
# Setup automated backups
crontab -e

# Add backup job (daily at 2 AM)
0 2 * * * /path/to/activepieces-sop-tool/deploy-sop.sh backup
```

### Monitoring Setup

#### 1. Enable Monitoring Services
```bash
# Deploy with monitoring profile
COMPOSE_PROFILES=monitoring docker-compose -f docker-compose.sop.yml up -d
```

#### 2. Configure Grafana Dashboards
- Access Grafana at http://localhost:3001
- Login with admin/admin (change immediately)
- Import SOP-specific dashboards from `/docker/grafana/dashboards/`

#### 3. Set Up Alerting
Configure alerts for:
- High API response times
- Database connection failures
- Disk space warnings
- Failed SOP executions

### Performance Optimization

#### 1. Database Tuning
```sql
-- PostgreSQL performance settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET max_connections = 100;

-- Restart PostgreSQL to apply changes
```

#### 2. Redis Configuration
```bash
# Redis performance settings
echo 'maxmemory 512mb' >> /etc/redis/redis.conf
echo 'maxmemory-policy allkeys-lru' >> /etc/redis/redis.conf
```

#### 3. Application Tuning
Update `.env` with performance settings:
```bash
# Performance Configuration
SOP_CONCURRENT_EXECUTIONS_LIMIT=100
SOP_TEMPLATE_CACHE_TTL=7200
SOP_SEARCH_INDEX_BATCH_SIZE=200
```

## Troubleshooting Installation

### Common Issues

#### Port Conflicts
**Error**: `Port already in use`
**Solution**: 
```bash
# Check what's using the port
lsof -i :3000
# Kill the process or change ports in .env
```

#### Memory Issues
**Error**: `Out of memory` errors
**Solution**:
```bash
# Increase Docker memory limits
# Add to ~/.docker/daemon.json
{
  "default-runtime": "runc",
  "runtimes": {
    "runc": {
      "path": "runc"
    }
  },
  "memory": "4g"
}
```

#### Database Connection Issues
**Error**: `Connection refused` to PostgreSQL
**Solution**:
```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.sop.yml ps postgres

# Check logs
docker-compose -f docker-compose.sop.yml logs postgres

# Reset database
docker-compose -f docker-compose.sop.yml down -v
docker-compose -f docker-compose.sop.yml up -d postgres
```

#### Permission Issues
**Error**: Permission denied writing to volumes
**Solution**:
```bash
# Fix volume permissions
sudo chown -R $USER:$USER ./logs ./uploads ./backups
chmod -R 755 ./logs ./uploads ./backups
```

### Health Check Commands

```bash
# System health overview
./deploy-sop.sh health

# Detailed service status
docker-compose -f docker-compose.sop.yml ps

# Check logs for errors
docker-compose -f docker-compose.sop.yml logs --tail=50 api
docker-compose -f docker-compose.sop.yml logs --tail=50 postgres
docker-compose -f docker-compose.sop.yml logs --tail=50 redis

# Test API endpoints
curl -X GET http://localhost:3000/health
curl -X GET http://localhost:3000/api/v1/templates

# Database connectivity
docker-compose -f docker-compose.sop.yml exec postgres pg_isready -U postgres
```

### Getting Support

#### Log Collection
When reporting issues, collect logs:
```bash
# Collect all logs
docker-compose -f docker-compose.sop.yml logs > sop-logs.txt

# Collect system information
./deploy-sop.sh health > sop-health.txt

# Create support bundle
tar -czf sop-support-$(date +%Y%m%d).tar.gz \
  sop-logs.txt \
  sop-health.txt \
  .env \
  docker-compose.sop.yml
```

#### Contact Information
- **Community Forum**: https://community.activepieces.com
- **GitHub Issues**: https://github.com/activepieces/activepieces/issues
- **Email Support**: support@activepieces.com

## Next Steps

After successful installation:

1. **User Management**: [User Management Guide](./user-management.md)
2. **Configuration**: [System Configuration](./configuration.md)
3. **Monitoring**: [System Monitoring](./monitoring.md)
4. **Backup**: [Backup and Recovery](./backup-recovery.md)

Your ActivePieces SOP Tool is now ready for production use!