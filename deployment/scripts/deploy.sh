#!/bin/bash

# FMS Production Deployment Script
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e

ENVIRONMENT=${1:-production}
PROJECT_DIR="/opt/fms"
BACKUP_DIR="/opt/fms/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting FMS deployment to $ENVIRONMENT..."

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root or with sudo"
    exit 1
fi

# Navigate to project directory
cd $PROJECT_DIR

# Backup database before deployment
echo "📦 Creating database backup..."
./deployment/scripts/backup.sh

# Pull latest code
echo "📥 Pulling latest code..."
git fetch origin
git checkout main
git pull origin main

# Copy environment file if not exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  .env.production not found. Please create it first!"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Pull latest images
echo "🐳 Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull

# Build and start containers
echo "🏗️  Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend npm run migration:run

# Health check
echo "🏥 Performing health check..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Health check passed!"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "⏳ Waiting for backend to be ready... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Health check failed! Rolling back..."
    ./deployment/scripts/rollback.sh
    exit 1
fi

# Clean up old Docker images
echo "🧹 Cleaning up old Docker images..."
docker system prune -f

# Show container status
echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

echo "✨ Deployment completed successfully!"
echo "🌐 Application URL: https://fms.yourdomain.com"
echo "📚 API Docs: https://api.fms.yourdomain.com/api/docs"
echo "📝 Logs: docker-compose -f docker-compose.prod.yml logs -f"
