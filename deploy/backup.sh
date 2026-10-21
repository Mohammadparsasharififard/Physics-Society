#!/usr/bin/env bash
# ==============================================================================
# Automated Database & Media Backup Script for Linux VPS
# Physics Association Platform - Shahid Beheshti 2 High School
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/physics_platform}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="physics_backup_${TIMESTAMP}"
TARGET_DIR="${BACKUP_DIR}/${BACKUP_NAME}"

# Source environment variables if .env exists in parent directory
if [ -f "$(dirname "$0")/../.env" ]; then
    export $(grep -v '^#' "$(dirname "$0")/../.env" | xargs)
fi

DB_CONTAINER="${DB_CONTAINER:-physics_postgres_prod}"
DB_USER="${POSTGRES_USER:-physics_user}"
DB_NAME="${POSTGRES_DB:-physics_db}"

echo "=========================================================="
echo " Starting Backup for Physics Association Platform"
echo " Timestamp: ${TIMESTAMP}"
echo "=========================================================="

mkdir -p "${TARGET_DIR}"

# 1. PostgreSQL Database Dump
echo "[1/3] Creating PostgreSQL database dump..."
docker exec "${DB_CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists > "${TARGET_DIR}/database.sql"
echo "Database dump complete (${TARGET_DIR}/database.sql)."

# 2. Backup Textbook & Uploaded Files
echo "[2/3] Archiving media files and uploaded textbooks..."
if [ -d "$(dirname "$0")/../data" ]; then
    tar -czf "${TARGET_DIR}/media_data.tar.gz" -C "$(dirname "$0")/.." data/
fi

# 3. Create Compressed Archive
echo "[3/3] Compressing complete backup package..."
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" -C "${BACKUP_DIR}" "${BACKUP_NAME}"
rm -rf "${TARGET_DIR}"

echo "=========================================================="
echo " Backup successfully created:"
echo " ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo " Size: $(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)"
echo "=========================================================="

# 4. Cleanup old backups (keep 14 days)
echo "Pruning backups older than 14 days..."
find "${BACKUP_DIR}" -name "physics_backup_*.tar.gz" -type f -mtime +14 -delete
echo "Backup process finished."
