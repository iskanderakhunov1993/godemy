#!/usr/bin/env bash
set -euo pipefail

# Script to add GitHub Secrets for staging CI/CD using gh CLI
# Works automatically after 'gh auth login'

OWNER="iskander"
REPO="golanger"
STAGING_SERVER="72.56.232.70"
STAGING_PASSWORD="gMQ4S?vSxtN^g8"

echo "🔐 GitHub Secrets Setup for Golanger"
echo "======================================"
echo ""

# Step 1: Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found"
    echo "Install it with: brew install gh"
    exit 1
fi

# Step 2: Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "⚠️  Not authenticated with GitHub"
    echo ""
    echo "Logging in to GitHub..."
    gh auth login
fi

# Step 3: Get SSH private key from staging server
echo ""
echo "🔑 Retrieving SSH private key from staging server..."
SSH_PRIVATE_KEY=$(sshpass -p "$STAGING_PASSWORD" ssh root@"$STAGING_SERVER" 'cat /root/.ssh/github_actions' 2>/dev/null)

if [ -z "$SSH_PRIVATE_KEY" ]; then
    echo "❌ Could not retrieve SSH key from staging server"
    exit 1
fi

echo "✓ SSH key retrieved"
echo ""

# Step 4: Add secrets using gh CLI
echo "📦 Adding GitHub Secrets..."
echo ""

# Function to add secret with gh CLI
add_secret_gh() {
    local name="$1"
    local value="$2"
    
    echo -n "  • $name ... "
    echo "$value" | gh secret set "$name" --repo "$OWNER/$REPO" 2>/dev/null && echo "✅" || echo "⚠️  (may already exist)"
}

add_secret_gh "STAGING_DEPLOY_HOST" "72.56.232.70"
add_secret_gh "STAGING_DEPLOY_PATH" "/opt/golanger-staging"
add_secret_gh "STAGING_SSH_PRIVATE_KEY" "$SSH_PRIVATE_KEY"

echo ""
echo "✨ All secrets configured!"
echo ""
echo "📋 Verify secrets at:"
echo "   https://github.com/$OWNER/$REPO/settings/secrets/actions"
echo ""
echo "🚀 Test the deployment:"
echo "   git push origin develop"
echo ""
echo "The GitHub Actions workflow will automatically:"
echo "  1. Trigger on push to 'develop'"
echo "  2. SSH into staging server (72.56.232.70)"
echo "  3. Run: ./scripts/deploy-staging.sh"
echo "  4. Update staging at: http://72.56.232.70"
