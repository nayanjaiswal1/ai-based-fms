#!/bin/bash

# FMS Database Restore Script
# Restores database from backup file

set -e

BACKUP_FILE=$1
DB_NAME="${DB_NAME:-fms_production}"
DB_USER="${DB_USER:-fms_user}"

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Usage: ./restore.sh <backup_file>"
    echo "📁 Available backups:"
    ls -lh /opt/fms/backups/fms_db_backup_*.sql.gz
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will restore the database from backup!"
echo "📦 Backup file: $BACKUP_FILE"
echo "🗄️  Database: $DB_NAME"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

echo "🗄️  Restoring database..."

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "🗜️  Decompressing backup..."
    gunzip -c $BACKUP_FILE | docker exec -i fms-postgres-prod psql -U $DB_USER $DB_NAME
else
    docker exec -i fms-postgres-prod psql -U $DB_USER $DB_NAME < $BACKUP_FILE
fi

echo "✅ Database restored successfully!"
echo "🔄 Restart backend: docker-compose -f docker-compose.prod.yml restart backend"
