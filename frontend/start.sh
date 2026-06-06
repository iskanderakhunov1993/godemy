#!/bin/sh
set -eu

PORT_TO_USE="${PORT:-3000}"

exec node_modules/.bin/next start -H 0.0.0.0 -p "$PORT_TO_USE"
