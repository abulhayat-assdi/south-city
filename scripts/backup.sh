#!/usr/bin/env bash
# Nightly backup of the Postgres DB + uploads volume (spec §15).
# Add to the deploy user's crontab, e.g.:
#   0 2 * * *  /opt/southdhaka/scripts/backup.sh >> /var/log/sdph-backup.log 2>&1
# Then copy the backup dir OFF the VPS (R2/S3/Drive) and TEST A RESTORE before go-live.
set -euo pipefail

STAMP="$(date +%F_%H%M)"
DIR="/opt/southdhaka/backups"
RETAIN_DAYS=21
mkdir -p "$DIR"

# 1) Database dump (runs pg_dump inside the db container; 5432 stays private).
docker compose exec -T db pg_dump -U sdph sdph | gzip > "$DIR/db_$STAMP.sql.gz"

# 2) Uploads volume (documents, media, brochures).
docker run --rm -v southdhaka_uploads:/data -v "$DIR":/backup alpine \
  tar czf "/backup/uploads_$STAMP.tar.gz" -C /data .

# 3) Prune old local copies (offsite copies should have their own retention).
find "$DIR" -name '*.gz' -mtime +$RETAIN_DAYS -delete

echo "✔ backup complete: db_$STAMP.sql.gz + uploads_$STAMP.tar.gz"
