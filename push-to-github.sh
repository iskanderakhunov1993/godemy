#!/bin/bash
# 🚀 Script to push Golanger to GitHub

echo "╔════════════════════════════════════════════════════╗"
echo "║  🚀 Golanger GitHub Push Script                     ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check if GitHub username is provided
if [ -z "$1" ]; then
    echo "❌ Использование: $0 <GITHUB_USERNAME>"
    echo ""
    echo "Пример: $0 iskander"
    echo ""
    echo "Это создаст репозиторий: https://github.com/iskander/golanger"
    exit 1
fi

GITHUB_USER=$1
REPO_NAME="golanger"
REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo "📝 Шаг 1: Проверка конфигурации Git"
git config user.name >/dev/null 2>&1 || {
    echo "⚠️  Git не сконфигурирован"
    echo "Настрой Git перед тем как продолжить:"
    echo "  git config --global user.name 'YOUR_NAME'"
    echo "  git config --global user.email 'your.email@example.com'"
    exit 1
}
echo "✅ Git сконфигурирован"
echo ""

echo "📝 Шаг 2: Добавление GitHub remote"
git remote add origin "$REPO_URL" 2>/dev/null || {
    git remote remove origin
    git remote add origin "$REPO_URL"
}
echo "✅ Remote добавлен: $REPO_URL"
echo ""

echo "📝 Шаг 3: Проверка веток"
git branch -M main
echo "✅ Ветка переименована в 'main'"
echo ""

echo "📝 Шаг 4: Заливаем на GitHub"
echo ""
echo "⚠️  ПЕРЕД ЭТИМ УБЕДИСЬ ЧТО:"
echo "  1. Создал репозиторий на GitHub: https://github.com/new"
echo "     (Имя: $REPO_NAME, тип: Private)"
echo "  2. НЕ инициализируй репозиторий с README"
echo ""
echo "Вводишь 'yes' для продолжения или 'no' для отмены:"
read -p "Продолжить? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Отменено"
    exit 1
fi

echo ""
echo "🚀 Заливаю код на GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════╗"
    echo "║  ✅ Успешно залито на GitHub!                      ║"
    echo "╚════════════════════════════════════════════════════╝"
    echo ""
    echo "📊 Репозиторий: $REPO_URL"
    echo "📝 Следующие шаги:"
    echo ""
    echo "  1️⃣  Открой DEPLOYMENT.md для полного гайда"
    echo "  2️⃣  Развертни на Vercel (frontend): https://vercel.com/new"
    echo "  3️⃣  Развертни на Railway (backend): https://railway.app/new"
    echo "  4️⃣  Добавь GitHub Actions секреты (см. DEPLOYMENT.md)"
    echo "  5️⃣  После этого каждый git push автоматически деплоится!"
    echo ""
    echo "🎉 Готово!"
else
    echo ""
    echo "❌ Ошибка при загрузке на GitHub"
    echo "Проверь:"
    echo "  • Интернет соединение"
    echo "  • Видимость репозитория (должен быть Public или Private с доступом)"
    echo "  • GitHub credentials (можешь нужно переть token)"
    exit 1
fi
