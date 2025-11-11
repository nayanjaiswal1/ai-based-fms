# Finance Management System - Deployment Guide

## Deployment Options

1. Docker Deployment (Recommended)
2. Manual Deployment
3. Cloud Platform Deployment (AWS, Azure, GCP)

## Docker Deployment

### Prerequisites

- Docker 24+
- Docker Compose v2+
- Domain name (for production)
- SSL certificates (for production)

### Production Docker Setup

1. **Create production docker-compose.yml**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: ${DATABASE_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: always

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    environment:
      NODE_ENV: production
      DATABASE_HOST: postgres
      REDIS_HOST: redis
    ports:
      - '3000:3000'
    depends_on:
      - postgres
      - redis
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data:
  redis_data:
```

2. **Set environment variables**

```bash
# Create production .env
cat > .env << EOF
DATABASE_USER=fms_prod_user
DATABASE_PASSWORD=<strong-password>
DATABASE_NAME=fms_prod_db
JWT_SECRET=<strong-jwt-secret>
JWT_REFRESH_SECRET=<strong-refresh-secret>
OPENAI_API_KEY=<your-openai-key>
EOF
```

3. **Deploy**

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

## Manual Deployment

### Backend Deployment

1. **Install dependencies**

```bash
cd backend
npm ci --only=production
```

2. **Build application**

```bash
npm run build
```

3. **Run migrations**

```bash
npm run migration:run
```

4. **Start with PM2**

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/main.js --name fms-backend

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Frontend Deployment

1. **Build application**

```bash
cd frontend
npm ci
npm run build
```

2. **Deploy with Nginx**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/fms/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Cloud Platform Deployment

### AWS Deployment

#### Using Elastic Beanstalk

1. **Install EB CLI**

```bash
pip install awsebcli
```

2. **Initialize EB**

```bash
eb init -p docker fms-app
```

3. **Create environment**

```bash
eb create fms-prod
```

4. **Deploy**

```bash
eb deploy
```

#### Using ECS (Fargate)

1. **Create ECR repositories**

```bash
aws ecr create-repository --repository-name fms-backend
aws ecr create-repository --repository-name fms-frontend
```

2. **Build and push images**

```bash
# Backend
cd backend
docker build -t fms-backend .
docker tag fms-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/fms-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/fms-backend:latest

# Frontend
cd frontend
docker build -t fms-frontend .
docker tag fms-frontend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/fms-frontend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/fms-frontend:latest
```

3. **Create ECS task definition and service**

Use AWS Console or AWS CLI to create ECS resources.

### Digital Ocean Deployment

1. **Create Droplet**

```bash
# Use Ubuntu 22.04 LTS
# Minimum: 2GB RAM, 2 vCPUs
```

2. **Install Docker**

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

3. **Deploy application**

```bash
# Clone repository
git clone <repository-url>
cd ai-based-fms

# Set environment variables
cp .env.example .env
# Edit .env

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

## SSL/TLS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Manual SSL Setup

1. **Obtain SSL certificates**

2. **Update Nginx configuration**

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... rest of configuration
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Database Backup

### Automated Backup Script

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="fms_db"
DB_USER="fms_user"

# Create backup
docker exec fms-postgres pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/fms_backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "fms_backup_*.sql.gz" -mtime +7 -delete
```

### Setup Cron Job

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-db.sh
```

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:3000/health

# Database health
docker exec fms-postgres pg_isready
```

### Logging

```bash
# View application logs
docker-compose logs -f backend

# View all logs
docker-compose logs -f

# Export logs
docker-compose logs > logs.txt
```

### Monitoring Tools

- **PM2 Monitoring**: `pm2 monit`
- **Docker Stats**: `docker stats`
- **Prometheus + Grafana**: For advanced monitoring

## Performance Optimization

### Backend

1. **Enable caching**
2. **Use connection pooling**
3. **Optimize database queries**
4. **Implement rate limiting**

### Frontend

1. **Enable Gzip compression**
2. **Use CDN for static assets**
3. **Implement lazy loading**
4. **Optimize images**

## Security Checklist

- [ ] Change default passwords
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Database encryption at rest
- [ ] Regular backups
- [ ] Monitor logs for suspicious activity

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or AWS ALB
2. **Multiple Backend Instances**: Run multiple containers
3. **Database Replication**: Setup read replicas
4. **Redis Cluster**: For distributed caching

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize database indexes
3. Implement caching strategies

## Rollback Procedure

```bash
# Rollback to previous version
docker-compose down
git checkout <previous-commit>
docker-compose up -d

# Rollback database migration
npm run migration:revert
```

## Troubleshooting

### Application won't start

```bash
# Check logs
docker-compose logs backend

# Check environment variables
docker-compose config

# Restart services
docker-compose restart
```

### Database connection issues

```bash
# Check PostgreSQL
docker exec fms-postgres psql -U fms_user -d fms_db -c "SELECT 1"

# Check credentials
echo $DATABASE_PASSWORD
```

### High memory usage

```bash
# Check memory usage
docker stats

# Restart services
docker-compose restart

# Scale down if needed
docker-compose up -d --scale backend=1
```

## Support

For deployment issues, contact the DevOps team or create an issue in the repository.
