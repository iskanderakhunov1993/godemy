#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <backend_url> <frontend_origin>"
  echo "Example: $0 https://your-backend.up.railway.app https://your-app.vercel.app"
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

BACKEND_URL="${1:-}"
FRONTEND_ORIGIN="${2:-}"

if [[ -z "$BACKEND_URL" || -z "$FRONTEND_ORIGIN" ]]; then
  usage
  exit 1
fi

BACKEND_URL="${BACKEND_URL%/}"
FRONTEND_ORIGIN="${FRONTEND_ORIGIN%/}"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  echo "PASS: $1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "FAIL: $1"
  if [[ -n "${2:-}" ]]; then
    echo "  Details: $2"
  fi
}

request() {
  local name="$1"
  shift
  local headers="$TMP_DIR/${name}.headers"
  local body="$TMP_DIR/${name}.body"

  local status
  status=$(curl -sS -o "$body" -D "$headers" -w "%{http_code}" "$@" || true)

  echo "$status"
}

header_has() {
  local headers_file="$1"
  local pattern="$2"
  grep -Eiq "$pattern" "$headers_file"
}

# 1) Health check
status=$(request health "$BACKEND_URL/api/health")
if [[ "$status" == "200" ]]; then
  if grep -Eiq '"status"\s*:\s*"ok"|ok' "$TMP_DIR/health.body"; then
    pass "Health endpoint is reachable"
  else
    fail "Health body validation" "Expected status ok in response body"
  fi
else
  fail "Health endpoint status" "Expected 200, got $status"
fi

# 2) CORS preflight for register
status=$(request cors_preflight \
  -X OPTIONS "$BACKEND_URL/api/auth/register" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type")

if [[ "$status" == "200" || "$status" == "204" ]]; then
  if header_has "$TMP_DIR/cors_preflight.headers" "^Access-Control-Allow-Origin:\s*${FRONTEND_ORIGIN//./\\.}\s*$"; then
    if header_has "$TMP_DIR/cors_preflight.headers" "^Access-Control-Allow-Methods:"; then
      pass "CORS preflight for register"
    else
      fail "CORS allow methods" "Missing Access-Control-Allow-Methods header"
    fi
  else
    fail "CORS allow origin" "Origin $FRONTEND_ORIGIN is not allowed"
  fi
else
  fail "CORS preflight status" "Expected 200/204, got $status"
fi

# 3) Register
TS="$(date +%s)"
EMAIL="smoke_${TS}@example.test"
USERNAME="smoke_${TS}"
PASSWORD="12345678"

register_payload=$(printf '{"email":"%s","username":"%s","password":"%s"}' "$EMAIL" "$USERNAME" "$PASSWORD")
status=$(request register \
  -X POST "$BACKEND_URL/api/auth/register" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Content-Type: application/json" \
  --data "$register_payload")

if [[ "$status" == "201" ]]; then
  if grep -q '"token"' "$TMP_DIR/register.body" && grep -q '"user"' "$TMP_DIR/register.body"; then
    pass "Register endpoint"
  else
    fail "Register response shape" "Expected token and user in response"
  fi
else
  fail "Register status" "Expected 201, got $status"
fi

# 4) Login
login_payload=$(printf '{"email":"%s","password":"%s"}' "$EMAIL" "$PASSWORD")
status=$(request login \
  -X POST "$BACKEND_URL/api/auth/login" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Content-Type: application/json" \
  --data "$login_payload")

if [[ "$status" == "200" ]]; then
  if grep -q '"token"' "$TMP_DIR/login.body"; then
    pass "Login endpoint"
  else
    fail "Login response shape" "Expected token in response"
  fi
else
  fail "Login status" "Expected 200, got $status"
fi

echo
echo "Summary: $PASS_COUNT passed, $FAIL_COUNT failed"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  exit 1
fi

echo "Smoke check completed successfully"
