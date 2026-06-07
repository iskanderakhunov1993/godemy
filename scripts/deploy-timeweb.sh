#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<EOF
Usage: $0 <repo-url> <domain> [app-dir]

Example:
  ./scripts/deploy-timeweb.sh https://github.com/USERNAME/golanger.git godemy.ru /opt/golanger

Environment variables:
  EMAIL        - email for Let's Encrypt notifications (default: admin@<domain>)
  DOMAIN      - optional domain override (if not passed as arg)
  APP_DIR      - optional app directory override (if not passed as arg)
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

REPO_URL="${1:-}"
DOMAIN="${2:-}"
APP_DIR="${3:-/opt/golanger}"

if [[ -z "$REPO_URL" || -z "$DOMAIN" ]]; then
  echo "ERROR: repo-url and domain are required"
  usage
  exit 1
fi

if [[ "$DOMAIN" == www.* ]]; then
  BASE_DOMAIN="${DOMAIN#www.}"
else
  BASE_DOMAIN="$DOMAIN"
fi

EMAIL="${EMAIL:-admin@$BASE_DOMAIN}"

install_package() {
  local pkg="$1"
  if ! command -v "$pkg" &>/dev/null; then
    echo "==> Installing $pkg..."
    apt-get update -y
    apt-get install -y "$pkg"
  fi
}

if ! command -v docker &>/dev/null; then
  install_package curl
  echo "==> Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
else
  echo "==> Docker already installed"
fi

if ! docker compose version &>/dev/null; then
  echo "==> Installing Docker Compose plugin..."
  install_package docker-compose-plugin
else
  echo "==> Docker Compose plugin already installed"
fi

mkdir -p "$APP_DIR"

if [[ -d "$APP_DIR/.git" ]]; then
  echo "==> Repository already exists in $APP_DIR, updating..."
  cd "$APP_DIR"
  git fetch --all --prune
  git checkout main
  git reset --hard origin/main
else
  echo "==> Cloning repository into $APP_DIR..."
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

check_env_file() {
  local file="$1"
  local example="$2"
  if [[ ! -f "$file" ]]; then
    cp "$example" "$file"
    echo "Created $file from $example. Please edit it with real values and run script again."
    exit 1
  fi
}

check_env_file backend/.env.production backend/.env.production.example
check_env_file frontend/.env.production frontend/.env.production.example
check_env_file .env.production .env.production.example

replace_env() {
  local file="$1"
  local key="$2"
  local value="$3"
  if grep -qE "^${key}=" "$file"; then
    sed -i -E "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

replace_env backend/.env.production CORS_ALLOWED_ORIGINS "http://$BASE_DOMAIN,http://www.$BASE_DOMAIN"
replace_env backend/.env.production FRONTEND_URL "http://$BASE_DOMAIN"
replace_env frontend/.env.production NEXT_PUBLIC_BACKEND_URL "http://$BASE_DOMAIN"
replace_env .env.production NEXT_PUBLIC_BACKEND_URL "http://$BASE_DOMAIN"

require_non_placeholder() {
  local file="$1"
  local key="$2"
  local value
  value="$(grep -E "^${key}=" "$file" | tail -n 1 | cut -d= -f2-)"

  if [[ -z "$value" || "$value" == *"ЗАМЕНИ"* || "$value" == *"replace-with"* || "$value" == "CHANGE_ME" ]]; then
    echo "ERROR: set a real value for $key in $file"
    exit 1
  fi
}

require_non_placeholder .env.production POSTGRES_PASSWORD
require_non_placeholder backend/.env.production JWT_SECRET
require_non_placeholder backend/.env.production ADMIN_SECRET

nginx_conf="docker/nginx/conf.d/golanger.conf"
if [[ -f "$nginx_conf" ]]; then
  echo "==> Updating nginx server_name to $BASE_DOMAIN"
  sed -i -E "s|server_name .*;|server_name $BASE_DOMAIN www.$BASE_DOMAIN;|" "$nginx_conf"
fi

if [[ ! -f docker-compose.prod.yml ]]; then
  echo "ERROR: docker-compose.prod.yml not found in $APP_DIR"
  exit 1
fi

echo "==> Building and starting containers..."
docker compose --env-file .env.production -f docker-compose.prod.yml pull --ignore-buildable
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build

cat <<EOF

============================================
Deploy completed for $BASE_DOMAIN

Next steps:
1) If you want HTTPS, request certificates:
   docker compose --env-file .env.production -f docker-compose.prod.yml run --rm certbot certonly \
     --webroot -w /var/www/certbot \
     -d $BASE_DOMAIN -d www.$BASE_DOMAIN \
     --email $EMAIL --agree-tos --non-interactive

2) Check logs:
   docker compose --env-file .env.production -f docker-compose.prod.yml logs -f

If nginx does not start, inspect the container logs for errors.
============================================
EOF
