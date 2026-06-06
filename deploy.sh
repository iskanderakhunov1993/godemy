#!/bin/bash
set -e

# =============================================
# Golanger Production Deploy Script
# Запускать на сервере от root
# =============================================

REPO_URL="https://github.com/YOUR_USERNAME/golanger.git"
APP_DIR="/opt/golanger"
DOMAIN="your-domain.com"
EMAIL="your-email@example.com"

echo "==> [1/7] Обновление системы и установка зависимостей..."
apt update && apt install -y curl git jq

echo "==> [2/7] Установка Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
else
  echo "Docker уже установлен"
fi

echo "==> [3/7] Установка Docker Compose plugin..."
if ! docker compose version &>/dev/null; then
  apt install -y docker-compose-plugin
fi

echo "==> [4/7] Клонирование/обновление репозитория..."
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR" && git pull
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "==> [5/7] Проверка .env файлов..."
if [ ! -f "$APP_DIR/backend/.env.production" ]; then
  echo "ОШИБКА: Нет файла $APP_DIR/backend/.env.production"
  echo "Скопируй backend/.env.production.example → backend/.env.production и заполни значения"
  exit 1
fi

if [ ! -f "$APP_DIR/frontend/.env.production" ]; then
  echo "ОШИБКА: Нет файла $APP_DIR/frontend/.env.production"
  echo "Скопируй frontend/.env.production.example → frontend/.env.production и заполни значения"
  exit 1
fi

echo "==> [6/7] Обновление домена в nginx конфиге..."
sed -i "s|app.example.com|$DOMAIN|g" "$APP_DIR/docker/nginx/conf.d/golanger.conf"

echo "==> [7/7] Сборка и запуск контейнеров..."
cd "$APP_DIR"
docker compose -f docker-compose.prod.yml pull --ignore-buildable
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "======================================"
echo "Деплой завершен!"
echo "Сайт доступен по адресу: http://$DOMAIN"
echo ""
echo "Для выпуска SSL сертификата выполни:"
echo "  docker compose -f docker-compose.prod.yml exec certbot certbot certonly \\"
echo "    --webroot -w /var/www/certbot \\"
echo "    -d $DOMAIN \\"
echo "    --email $EMAIL \\"
echo "    --agree-tos --non-interactive"
echo ""
echo "Для просмотра логов:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo "======================================"
