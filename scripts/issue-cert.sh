#!/usr/bin/env sh
set -eu

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <domain> <email>"
  exit 1
fi

DOMAIN="$1"
EMAIL="$2"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONF_FILE="$ROOT_DIR/docker/nginx/conf.d/golanger.conf"
HTTPS_TEMPLATE="$ROOT_DIR/docker/nginx/conf.d/golanger-https.conf.example"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose is required"
  exit 1
fi

# 1) Start stack in HTTP mode for ACME challenge.
docker compose -f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/docker-compose.prod.yml" up -d db backend nginx

# 2) Request certificate using webroot challenge.
docker compose -f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/docker-compose.prod.yml" run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  -d "$DOMAIN" \
  --email "$EMAIL" --agree-tos --no-eff-email

# 3) Switch nginx config to HTTPS mode for the provided domain.
sed "s/app\.example\.com/$DOMAIN/g" "$HTTPS_TEMPLATE" > "$CONF_FILE"

# 4) Reload nginx and start renewal daemon.
docker compose -f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/docker-compose.prod.yml" up -d certbot
docker compose -f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/docker-compose.prod.yml" restart nginx

echo "Certificate issued and HTTPS enabled for $DOMAIN"
