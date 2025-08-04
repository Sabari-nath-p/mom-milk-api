#!/bin/bash

# Database backup script for Mom's Milk API
# This script creates automated backups of the MySQL database

set -e

# Configuration
DB_HOST="mysql"
DB_NAME="${MYSQL_DATABASE:-moms_milk}"
DB_USER="root"
DB_PASSWORD="${MYSQL_ROOT_PASSWORD}"
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/moms_milk_backup_${TIMESTAMP}.sql"
MAX_BACKUPS=7  # Keep last 7 backups

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "Starting database backup at $(date)"

# Create database backup
mysqldump -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" \
    --single-transaction \
    --routines \
    --triggers \
    --databases "${DB_NAME}" > "${BACKUP_FILE}"

# Compress the backup
gzip "${BACKUP_FILE}"
BACKUP_FILE="${BACKUP_FILE}.gz"

echo "Backup created: ${BACKUP_FILE}"

# Verify backup integrity
if [ -f "${BACKUP_FILE}" ]; then
    BACKUP_SIZE=$(stat -c%s "${BACKUP_FILE}")
    if [ "${BACKUP_SIZE}" -gt 1000 ]; then
        echo "Backup successful. Size: ${BACKUP_SIZE} bytes"
    else
        echo "Warning: Backup file seems too small (${BACKUP_SIZE} bytes)"
        exit 1
    fi
else
    echo "Error: Backup file not found"
    exit 1
fi

# Clean up old backups (keep only last MAX_BACKUPS)
echo "Cleaning up old backups..."
cd "${BACKUP_DIR}"
ls -t moms_milk_backup_*.sql.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f

echo "Backup completed successfully at $(date)"

# Optional: Upload to cloud storage (uncomment and configure as needed)
# aws s3 cp "${BACKUP_FILE}" s3://your-backup-bucket/database-backups/
# or
# rclone copy "${BACKUP_FILE}" remote:backup-folder/
