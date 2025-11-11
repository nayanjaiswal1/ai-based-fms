#!/bin/bash

# FMS Database Backup Script
# Creates a timestamped backup of the PostgreSQL database

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/fms/backups"
PROJECT_DIR="/opt/fms"
DB_NAME="${DB_NAME:-fms_production}"
DB_USER="${DB_USER:-fms_user}"
RETENTION_DAYS=30

echo "📦 Starting database backup..."

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Create backup filename
BACKUP_FILE="$BACKUP_DIR/fms_db_backup_$TIMESTAMP.sql"
BACKUP_FILE_COMPRESSED="$BACKUP_FILE.gz"

# Perform backup
echo "🗄️  Backing up database: $DB_NAME"
docker exec fms-postgres-prod pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

# Compress backup
echo "🗜️  Compressing backup..."
gzip $BACKUP_FILE

# Get backup size
BACKUP_SIZE=$(du -h $BACKUP_FILE_COMPRESSED | cut -f1)

# Delete old backups (older than RETENTION_DAYS)
echo "🧹 Cleaning up old backups (older than $RETENTION_DAYS days)..."
find $BACKUP_DIR -name "fms_db_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# Show backup info
echo "✅ Backup completed successfully!"
echo "📁 Backup file: $BACKUP_FILE_COMPRESSED"
echo "📏 Backup size: $BACKUP_SIZE"
echo "📊 Total backups: $(ls -1 $BACKUP_DIR/fms_db_backup_*.sql.gz 2>/dev/null | wc -l)"

# Optional: Upload to S3/Cloud storage
if [ ! -z "$AWS_S3_BUCKET" ]; then
    echo "☁️  Uploading to S3..."
    aws s3 cp $BACKUP_FILE_COMPRESSED s3://$AWS_S3_BUCKET/backups/
    echo "✅ Uploaded to S3"
fi
