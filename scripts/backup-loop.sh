#!/bin/sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_INTERVAL_SECONDS="${BACKUP_INTERVAL_SECONDS:-86400}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"

while true; do
  timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
  target="$BACKUP_DIR/golanger-$timestamp.sql.gz"

  if PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
    --host="$POSTGRES_HOST" \
    --username="$POSTGRES_USER" \
    --dbname="$POSTGRES_DB" \
    --no-owner \
    --no-privileges \
    | gzip > "$target"; then
    echo "Backup created: $target"
    find "$BACKUP_DIR" -type f -name 'golanger-*.sql.gz' -mtime "+$BACKUP_RETENTION_DAYS" -delete
  else
    echo "Backup failed" >&2
    rm -f "$target"
  fi

  sleep "$BACKUP_INTERVAL_SECONDS"
done
