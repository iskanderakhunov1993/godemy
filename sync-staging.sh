#!/bin/bash

# Sync staging environment with production
# Usage: ./sync-staging.sh <prod_password> <staging_password>

set -e

PROD_IP="186.246.5.197"
STAGING_IP="72.56.232.70"
PROD_PASS="$1"
STAGING_PASS="$2"

if [ -z "$PROD_PASS" ] || [ -z "$STAGING_PASS" ]; then
    echo "Usage: $0 <prod_password> <staging_password>"
    exit 1
fi

echo "=========================================="
echo "🔄 Syncing Staging with Production"
echo "=========================================="
echo ""

# 1. Create backup from production
echo "📦 Step 1: Creating backup from production..."
sshpass -p "$PROD_PASS" ssh root@$PROD_IP \
    "docker exec golanger-db pg_dump -U golanger golanger | gzip > /tmp/prod-backup.sql.gz" && \
    echo "✅ Production backup created"

# 2. Copy backup to local machine
echo ""
echo "📥 Step 2: Copying backup to local machine..."
sshpass -p "$PROD_PASS" scp -o StrictHostKeyChecking=no root@$PROD_IP:/tmp/prod-backup.sql.gz /tmp/prod-backup.sql.gz && \
    echo "✅ Backup copied"

# 3. Copy backup to staging
echo ""
echo "📤 Step 3: Copying backup to staging server..."
sshpass -p "$STAGING_PASS" scp -o StrictHostKeyChecking=no /tmp/prod-backup.sql.gz root@$STAGING_IP:/tmp/prod-backup.sql.gz && \
    echo "✅ Backup transferred to staging"

# 4. Stop staging backend
echo ""
echo "🛑 Step 4: Stopping staging backend..."
sshpass -p "$STAGING_PASS" ssh -o StrictHostKeyChecking=no root@$STAGING_IP \
    "docker stop golanger-staging-backend" && \
    echo "✅ Backend stopped"

# 5. Reset database - truncate all tables
echo ""
echo "🗑️  Step 5: Resetting staging database..."
sshpass -p "$STAGING_PASS" ssh -o StrictHostKeyChecking=no root@$STAGING_IP \
    "docker exec golanger-staging-db psql -U golanger golanger_staging -c 'TRUNCATE TABLE progresses, exercises, lessons, modules, topics, levels, users CASCADE;'" && \
    echo "✅ Database tables cleared"

# 6. Restore backup
echo ""
echo "⚙️  Step 6: Restoring backup to staging..."
sshpass -p "$STAGING_PASS" ssh -o StrictHostKeyChecking=no root@$STAGING_IP \
    "gunzip -c /tmp/prod-backup.sql.gz | docker exec -i golanger-staging-db psql -U golanger golanger_staging" && \
    echo "✅ Backup restored"

# 7. Restart backend
echo ""
echo "🔄 Step 7: Restarting staging backend..."
sshpass -p "$STAGING_PASS" ssh -o StrictHostKeyChecking=no root@$STAGING_IP \
    "docker start golanger-staging-backend && sleep 3" && \
    echo "✅ Backend restarted"

# 8. Verify
echo ""
echo "🧪 Step 8: Verifying staging API..."
sleep 2
RESPONSE=$(curl -s http://$STAGING_IP:18080/api/levels)
if [ "$RESPONSE" != "[]" ]; then
    echo "✅ Staging API is working with data"
else
    echo "⚠️  Warning: Staging API returned empty levels"
fi

# 9. Check production for comparison
echo ""
echo "🔍 Step 9: Comparing with production..."
PROD_RESPONSE=$(curl -s http://$PROD_IP/api/levels)
PROD_COUNT=$(echo "$PROD_RESPONSE" | grep -o '"id"' | wc -l)
STAGING_COUNT=$(echo "$RESPONSE" | grep -o '"id"' | wc -l)

echo "Production levels: $PROD_COUNT"
echo "Staging levels: $STAGING_COUNT"

if [ "$PROD_COUNT" -eq "$STAGING_COUNT" ]; then
    echo "✅ Staging and Production have the same data!"
else
    echo "⚠️  Warning: Data counts don't match"
fi

echo ""
echo "=========================================="
echo "✅ Sync complete!"
echo "=========================================="
echo ""
echo "Staging URLs:"
echo "  Frontend: http://$STAGING_IP:13000"
echo "  Backend: http://$STAGING_IP:18080"
