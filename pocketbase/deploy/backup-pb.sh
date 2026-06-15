#!/usr/bin/env bash
set -euo pipefail

# Backup PocketBase pb_data directory with timestamped tarball.
# Install to /usr/local/bin/backup-pb.sh and schedule via cron.

PB_DATA_DIR="${PB_DATA_DIR:-/opt/pocketbase/pb_data}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/pocketbase}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE="${BACKUP_DIR}/pb_data-${TIMESTAMP}.tar.gz"

mkdir -p "${BACKUP_DIR}"

if [[ ! -d "${PB_DATA_DIR}" ]]; then
  echo "pb_data directory not found: ${PB_DATA_DIR}" >&2
  exit 1
fi

tar -czf "${ARCHIVE}" -C "$(dirname "${PB_DATA_DIR}")" "$(basename "${PB_DATA_DIR}")"
echo "Created ${ARCHIVE}"

find "${BACKUP_DIR}" -name 'pb_data-*.tar.gz' -mtime +"${RETENTION_DAYS}" -delete
