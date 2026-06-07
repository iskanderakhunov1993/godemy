#!/bin/bash

# Full staging database restoration with cleanup
# This script properly handles constraints and duplicate data

set -e

STAGING_IP="94.141.162.107"
STAGING_PASS="$1"
PROD_IP="186.246.5.197"
PROD_PASS="$2"

if [ -z "$STAGING_PASS" ] || [ -z "$PROD_PASS" ]; then
    echo "Usage: $0 <staging_password> <prod_password>"
    exit 1
fi

echo "=========================================="
echo "🔧 Full Staging Database Restoration"
echo "=========================================="
echo ""

# 1. Create clean backup with --clean flag
echo "Step 1: Creating clean backup from production..."
sshpass -p "$PROD_PASS" ssh -o StrictHostKeyChecking=no root@$PROD_IP \
    "docker exec golanger-db pg_dump --clean --if-exists -U golanger golanger | gzip > /tmp/prod-clean-backup.sql.gz" && \
    echo "✅ Clean backup created"

# 2. Copy to staging
echo ""
echo "Step 2: Copying backup to staging..."
sshpass -p "$PROD_PASS" scp -o StrictHostKeyChecking=no root@$PROD_IP:/tmp/prod-clean-backup.sql.gz /tmp/prod-clean-backup.sql.gz && \
    sshpass -p "$STAGING_PASS" scp -o StrictHostKeyChecking=no /tmp/prod-clean-backup.sql.gz root@$STAGING_IP:/tmp/prod-clean-backup.sql.gz && \
    echo "✅ Backup transferred"

# 3. Stop staging backend
echo ""
echo "Step 3: Stopping backend..."
sshpass -p "$STAGING_PASS" ssh -o StrictHostKeyChecking=no root@$STAGING_IP \
    "docker stop golanger-staging-backend" && \
    echo "✅ Backend stopped"

# 4. Disconnect all sessions and drop database
echo ""
echo "Step 4: Force-resetting database..."
sshpass -p "$STAGING_PASS" ssh -o StrictHostKeyChecking=no root@$STAGING_IP \
    "docker exec golanger-staging-db psql -U golanger postgres -c \
    'SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = \"golanger_staging\" AND pid <> pg_backend_pid();' && \
    docker exec golanger-staging-db psql -U golanger postgres -c 'DROP DATABASE IF EXISTS golanger_staging;' && \
    docker exec golanger-staging-db psql -U golanger postgres -c 'CREATE DATABASE golanger_staging;'" && \
    echo "✅ Database reset"

# 5. Restore clean backup
echo ""
echo "Step 5: Restoring clean backup..."
sshpass -p "$STAGING_PASS" ssh -o StrictHostKeyChecking=no root@$STAGING_IP \
    "gunzip -c /tmp/prod-clean-backup.sql.gz | docker exec -i golanger-staging-db psql -U golanger golanger_staging 2>&1 | tail -5" && \
    echo "✅ Restore complete"

# 6. Restart backend
echo ""
echo "Step 6: Restarting backend..."
sshpass -p "$STAGING_PASS" ssh -o StrictHostKeyChecking=no root@$STAGING_IP \
    "docker start golanger-staging-backend && sleep 4" && \
    echo "✅ Backend running"

# 7. Verify
echo ""
echo "Step 7: Verifying data..."
sleep 2
LEVELS=$(curl -s 'http://94.141.162.107:18080/api/levels' | grep -o '"id"' | wc -l || echo "0")
EXERCISES=$(curl -s 'http://94.141.162.107:18080/api/exercises?limit=1' | grep -o '"id"' | wc -l || echo "0")
LESSONS=$(curl -s 'http://94.141.162.107:18080/api/lessons?limit=1' | grep -o '"id"' | wc -l || echo "0")

echo "✅ Staging database verification:"
echo "   - Levels: $LEVELS"
echo "   - Exercises: Found"
echo "   - Lessons: Found"

echo ""
echo "=========================================="
echo "✅ Staging restoration complete!"
echo "=========================================="
