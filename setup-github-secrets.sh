#!/usr/bin/env bash
# Quick setup for GitHub Actions secrets

set -euo pipefail

echo "🔐 GitHub Actions Secrets Setup"
echo "================================"
echo ""

# Step 1: Check if already authenticated
if ! gh auth status &>/dev/null; then
    echo "❌ Not authenticated with GitHub"
    echo ""
    echo "Run this command to log in:"
    echo ""
    echo "  gh auth login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Authenticated with GitHub"
echo ""

# Step 2: Get SSH key from staging
STAGING_PASSWORD="gMQ4S?vSxtN^g8"
STAGING_SERVER="72.56.232.70"

echo "Retrieving SSH key from staging server..."
SSH_KEY=$(sshpass -p "$STAGING_PASSWORD" ssh root@"$STAGING_SERVER" 'cat /root/.ssh/github_actions' 2>/dev/null)

if [ -z "$SSH_KEY" ]; then
    echo "❌ Could not get SSH key from server"
    exit 1
fi

echo "✅ SSH key retrieved"
echo ""

# Step 3: Add secrets
echo "Adding secrets to GitHub..."
echo ""

echo "$SSH_KEY" | gh secret set STAGING_SSH_PRIVATE_KEY --repo iskander/golanger 2>/dev/null && echo "✅ STAGING_SSH_PRIVATE_KEY" || echo "⚠️  STAGING_SSH_PRIVATE_KEY"
echo "72.56.232.70" | gh secret set STAGING_DEPLOY_HOST --repo iskander/golanger 2>/dev/null && echo "✅ STAGING_DEPLOY_HOST" || echo "⚠️  STAGING_DEPLOY_HOST"
echo "/opt/golanger-staging" | gh secret set STAGING_DEPLOY_PATH --repo iskander/golanger 2>/dev/null && echo "✅ STAGING_DEPLOY_PATH" || echo "⚠️  STAGING_DEPLOY_PATH"

echo ""
echo "✨ Done!"
echo ""
echo "Next: git push origin develop"
