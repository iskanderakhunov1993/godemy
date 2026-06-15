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
ENV_FILE="$ROOT_DIR/.env.production"
COMPOSE_FILE="$ROOT_DIR/docker-compose.prod.yml"
HTTP_BACKUP="$ROOT_DIR/docker/nginx/conf.d/golanger.conf.http-backup"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose is required"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "$ENV_FILE is required"
  exit 1
fi

# Preserve the current HTTP config so we can restore it if certificate issuance fails.
cp "$CONF_FILE" "$HTTP_BACKUP"
restore_http_config() {
  cp "$HTTP_BACKUP" "$CONF_FILE" >/dev/null 2>&1 || true
}
trap restore_http_config EXIT

# 1) Start stack without nginx so certbot can bind to 443 for tls-alpn-01.
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d db backend frontend
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop nginx

# 2) Request certificate using tls-alpn-01 to avoid webroot fetch issues.
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm --service-ports --entrypoint certbot certbot \
  certonly --standalone --preferred-challenges tls-alpn-01 \
  -d "$DOMAIN" \
  --email "$EMAIL" --agree-tos --no-eff-email

# 3) Switch nginx config to HTTPS mode for the provided domain.
sed "s/app\.example\.com/$DOMAIN/g" "$HTTPS_TEMPLATE" > "$CONF_FILE"

# 4) Restore nginx and start renewal daemon.
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d certbot
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d nginx

rm -f "$HTTP_BACKUP"
trap - EXIT

echo "Certificate issued and HTTPS enabled for $DOMAIN"
