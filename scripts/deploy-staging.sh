#!/usr/bin/env bash
set -euo pipefail

# Deploy/update staging stack on a target server.
APP_DIR="${APP_DIR:-/opt/golanger-staging}"

if [[ ! -d "$APP_DIR" ]]; then
  echo "ERROR: app directory not found: $APP_DIR"
  echo "Clone the repository first, for example:"
  echo "  git clone <repo-url> $APP_DIR"
  exit 1
fi

cd "$APP_DIR"

if [[ ! -f .env.staging ]]; then
  echo "ERROR: missing .env.staging"
  echo "Copy .env.staging.example to .env.staging and fill real values."
  exit 1
fi

if [[ ! -f backend/.env.staging ]]; then
  echo "ERROR: missing backend/.env.staging"
  echo "Copy backend/.env.staging.example to backend/.env.staging and fill real values."
  exit 1
fi

if [[ ! -f frontend/.env.staging ]]; then
  echo "ERROR: missing frontend/.env.staging"
  echo "Copy frontend/.env.staging.example to frontend/.env.staging and fill real values."
  exit 1
fi

cp backend/.env.staging backend/.env
cp frontend/.env.staging frontend/.env

docker compose --env-file .env.staging -f docker-compose.staging.yml pull --ignore-buildable

docker compose --env-file .env.staging -f docker-compose.staging.yml up -d --build

echo "Staging deploy completed."
echo "Frontend: http://<server-ip>:13000"
echo "Backend:  http://<server-ip>:18080"
