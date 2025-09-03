# SOP Tool Deployment Guide

## Overview
Simple production deployment for the Activepieces SOP tool. **Anti-over-engineering approach** - minimal setup that works.

## Prerequisites
- Docker and Docker Compose
- Domain name (optional, can use IP)
- Basic server (2GB RAM minimum)

## Quick Deployment (5 Minutes)

### 1. Server Setup
```bash
# Clone the forked repository
git clone https://github.com/YOUR-ORG/activepieces-sop-tool.git
cd activepieces-sop-tool

# Switch to production branch
git checkout sop-customization
```

### 2. Environment Configuration
```bash
# Copy production environment file
cp .env.example .env.production

# Edit production settings
nano .env.production
```

```bash
# .env.production - MINIMAL SETTINGS ONLY
NODE_ENV=production
DATABASE_URL=postgresql://postgres:soppassword@db:5432/sopdb
AP_FRONTEND_URL=http://your-domain.com  # or http://YOUR_SERVER_IP
AP_BACKEND_URL=http://your-domain.com/api
AP_BRANDING_ENABLED=true
AP_SOP_MODE=true

# Database settings
POSTGRES_DB=sopdb
POSTGRES_USER=postgres  
POSTGRES_PASSWORD=soppassword

# SECURITY: Change password in production
```

### 3. Production Build & Deploy
```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start (30-60 seconds)
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  
  sop-frontend:
    build:
      context: .
      dockerfile: packages/ui/frontend/Dockerfile
    ports:
      - "80:80"
    environment:
      - API_URL=http://sop-backend:3000
    depends_on:
      - sop-backend
    restart: unless-stopped
  
  sop-backend:
    build:
      context: .
      dockerfile: packages/backend/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:soppassword@db:5432/sopdb
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: sopdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: soppassword
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
  
  # Optional: Redis for session storage
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## Verification Checklist

### Deployment Health Check
```bash
# Check all services are running
docker-compose -f docker-compose.prod.yml ps

# Check application responds
curl http://localhost/api/health

# Check database connection
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d sopdb -c "SELECT 1;"
```

### Functional Testing
- [ ] Frontend loads at http://your-domain.com
- [ ] Can create new SOP
- [ ] Can add SOP pieces to workflow
- [ ] Export to JSON works
- [ ] Export to text works
- [ ] No console errors in browser
- [ ] Database persists data after restart

## Minimal Monitoring

### Basic Health Monitoring
```bash
# Create simple health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
if curl -f -s http://localhost/api/health > /dev/null; then
    echo "$(date): SOP Tool is healthy"
else
    echo "$(date): SOP Tool is DOWN - restarting..."
    docker-compose -f docker-compose.prod.yml restart
fi
EOF

chmod +x health-check.sh

# Add to crontab for every 5 minutes
echo "*/5 * * * * /path/to/health-check.sh >> /var/log/sop-health.log" | crontab -
```

### Log Management
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f sop-backend
docker-compose -f docker-compose.prod.yml logs -f sop-frontend

# Basic log rotation (to prevent disk fill)
echo "0 0 * * 0 docker system prune -f" | crontab -
```

## Backup Strategy (Simple)

### Database Backup
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/sop"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres sopdb > $BACKUP_DIR/sopdb_$DATE.sql

# Keep only last 7 backups
find $BACKUP_DIR -name "sopdb_*.sql" -mtime +7 -delete

echo "$(date): Backup completed - sopdb_$DATE.sql"
EOF

chmod +x backup.sh

# Schedule daily backup at 2 AM
echo "0 2 * * * /path/to/backup.sh >> /var/log/sop-backup.log" | crontab -
```

### Restore from Backup
```bash
# Stop services
docker-compose -f docker-compose.prod.yml stop

# Restore database
cat /backups/sop/sopdb_YYYYMMDD_HHMMSS.sql | docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres sopdb

# Start services
docker-compose -f docker-compose.prod.yml start
```

## Security Considerations (Minimal)

### Basic Security Measures
```bash
# 1. Change default passwords
# Edit .env.production with strong passwords

# 2. Firewall (Ubuntu/Debian)
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS (if using SSL)
ufw enable

# 3. Basic SSL with Let's Encrypt (optional)
# Install certbot and configure reverse proxy
```

### Environment Variables Security
```bash
# Secure the environment file
chmod 600 .env.production
chown root:root .env.production
```

## Updates and Maintenance

### Update Procedure
```bash
# 1. Backup first
./backup.sh

# 2. Pull latest changes
git pull origin sop-customization

# 3. Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify deployment
curl http://localhost/api/health
```

### Troubleshooting

#### Common Issues
1. **Frontend not loading**: Check nginx/apache proxy settings
2. **Database connection failed**: Verify DATABASE_URL in environment
3. **Export not working**: Check backend API connectivity
4. **Out of disk space**: Run `docker system prune -f`

#### Debug Commands
```bash
# View container status
docker-compose -f docker-compose.prod.yml ps

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs --tail=100 sop-backend

# Enter container for debugging
docker-compose -f docker-compose.prod.yml exec sop-backend bash
```

## Production Limitations

### What This Deployment DOES NOT Include
- Load balancing (single server only)
- Advanced monitoring (basic health check only)
- Complex user management (basic authentication)
- Advanced backup strategies (simple daily backup)
- CDN or asset optimization
- Advanced security hardening
- Multi-environment deployment
- CI/CD pipelines

### Scaling Considerations
- **Users**: Supports 10-50 concurrent users
- **SOPs**: Handles 1000+ SOPs per client
- **Storage**: Monitor disk usage monthly
- **Memory**: 2GB RAM minimum, 4GB recommended

This deployment guide provides a production-ready SOP tool while maintaining simplicity and avoiding over-engineering. The system will be operational and maintainable without complex infrastructure requirements.