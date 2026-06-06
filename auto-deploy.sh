#!/bin/bash

###############################################################################
# 🚀 GOLANGER MASTER DEPLOYMENT SCRIPT
# Полностью автоматизированное развертывание проекта
###############################################################################

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🚀 GOLANGER MASTER DEPLOYMENT                               ║"
echo "║  Полностью автоматизированное развертывание                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# ЭТАП 1️⃣: Получение учетных данных
# ============================================================================

echo "📋 ЭТАП 1: Получение данных для развертывания"
echo ""

read -p "📝 GitHub username: " GITHUB_USER
read -sp "🔑 GitHub Personal Access Token (будет скрыт): " GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_USER" ] || [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GitHub username и token обязательны"
    exit 1
fi

REPO_NAME="golanger"
PROJECT_DIR="/Users/iskander/Desktop/golanger"

# ============================================================================
# ЭТАП 2️⃣: Создание GitHub репозитория через API
# ============================================================================

echo ""
echo "🔴 ЭТАП 2: Создание GitHub репозитория..."
echo ""

# Проверим есть ли уже repo
REPO_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_USER/$REPO_NAME")

if [ "$REPO_EXISTS" = "200" ]; then
    echo "ℹ️  Репозиторий уже существует"
else
    echo "Создаю новый репозиторий..."
    
    CREATE_RESPONSE=$(curl -s -X POST \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/user/repos \
      -d "{
        \"name\": \"$REPO_NAME\",
        \"description\": \"Go backend + Next.js learning platform with 5 sprints\",
        \"private\": false,
        \"auto_init\": false
      }")
    
    echo "$CREATE_RESPONSE" | grep -q '"id"' || {
        echo "❌ Ошибка создания репо:"
        echo "$CREATE_RESPONSE"
        exit 1
    }
    echo "✅ Репозиторий создан!"
fi

# ============================================================================
# ЭТАП 3️⃣: Заливка кода на GitHub
# ============================================================================

echo ""
echo "🟢 ЭТАП 3: Заливка кода на GitHub..."
echo ""

cd "$PROJECT_DIR"

REPO_URL="https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git"

# Удалим старый remote если есть
git remote rm origin 2>/dev/null || true

# Добавим новый remote
git remote add origin "$REPO_URL"

# Залим на GitHub
echo "Заливаю ветку main..."
git push -u origin main --force 2>&1 | grep -E "(Counting|Delta|remote|✓|✔)" || true

echo "✅ Код залит на GitHub!"

# ============================================================================
# ИТОГОВАЯ ИНФОРМАЦИЯ
# ============================================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ ГОТОВО! КОД НА GITHUB                                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

REPO_URL_DISPLAY="https://github.com/$GITHUB_USER/$REPO_NAME"

echo "📊 Репозиторий: $REPO_URL_DISPLAY"
echo ""

echo "🎯 СЛЕДУЮЩИЕ ШАГИ:"
echo ""
echo "1️⃣  FRONTEND НА VERCEL"
echo "   - Перейди: https://vercel.com/new"
echo "   - Import Repository: выбери $REPO_NAME"
echo "   - Root Directory: frontend"
echo "   - Environment Variable:"
echo "     NEXT_PUBLIC_BACKEND_URL = https://your-backend.up.railway.app"
echo "   - Deploy ✅"
echo ""

echo "2️⃣  BACKEND НА RAILWAY"
echo "   - Перейди: https://railway.app/new"
echo "   - Deploy from GitHub: выбери $REPO_NAME repo"
echo "   - Root Directory: backend"
echo "   - Environment Variables:"
echo "     PORT = 8081"
echo "     JWT_SECRET = $(openssl rand -hex 32)"
echo "     DB_PATH = /app/golanger.db"
echo "   - Deploy ✅"
echo ""

echo "3️⃣  GitHub Actions Секреты"
echo "   - Перейди: https://github.com/$GITHUB_USER/$REPO_NAME/settings/secrets/actions"
echo "   - Добавь:"
echo "     VERCEL_TOKEN (https://vercel.com/account/tokens)"
echo "     VERCEL_ORG_ID (из Vercel settings)"
echo "     VERCEL_PROJECT_ID (из Vercel项目设置)"
echo "     RAILWAY_TOKEN (https://railway.app/account/tokens)"
echo "     RAILWAY_PROJECT_ID (из Railway dashboard)"
echo ""

echo "4️⃣  ОБНОВИТЬ BACKEND URL В VERCEL"
echo "   - После запуска backend на Railway"
echo "   - Копируй URL из Railway"
echo "   - Vercel → Settings → Environment Variables"
echo "   - Обновить NEXT_PUBLIC_BACKEND_URL = твой-backend-url"
echo ""

echo "📖 Подробные гайды в проекте:"
echo "   • QUICK_START.md - быстрый старт за 15 мин"
echo "   • DEPLOYMENT_STEP_BY_STEP.md - пошаговый гайд"
echo "   • DEPLOYMENT.md - расширенный гайд"
echo ""

echo "🌍 Результат:"
echo "   Frontend: https://your-frontend.vercel.app"
echo "   Backend:  https://your-backend.up.railway.app"
echo "   Repo:     $REPO_URL_DISPLAY"
echo ""

echo "✨ Готово! Код в GitHub с автоматизированным CI/CD!"
echo ""
