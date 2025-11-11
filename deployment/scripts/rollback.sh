#!/bin/bash

# FMS Rollback Script
# Rolls back to previous deployment

set -e

PROJECT_DIR="/opt/fms"
BACKUP_DIR="/opt/fms/backups"

echo "⏪ Starting rollback..."

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root or with sudo"
    exit 1
fi

cd $PROJECT_DIR

# Stop current containers
echo "🛑 Stopping current containers..."
docker-compose -f docker-compose.prod.yml down

# Checkout previous commit
echo "📥 Rolling back to previous version..."
git reset --hard HEAD~1

# Start containers with previous version
echo "🏗️  Starting previous version..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
echo "⏳ Waiting for services..."
sleep 10

# Health check
echo "🏥 Performing health check..."
MAX_RETRIES=20
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Health check passed!"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "⏳ Waiting for backend... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Rollback health check failed!"
    exit 1
fi

echo "✅ Rollback completed successfully!"
echo "📝 Note: Database might need manual restoration if schema changed"
echo "📦 To restore database: ./deployment/scripts/restore.sh <backup_file>"
