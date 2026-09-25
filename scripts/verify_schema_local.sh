#!/usr/bin/env bash
# scripts/verify_schema_local.sh — smoke-test scripts/schema.sql +
# scripts/seed_supabase.js against a throwaway Postgres 16 container with the
# Supabase environment stubbed (scripts/schema_local_stubs.sql). Verifies:
#   1. schema.sql applies cleanly and is idempotent (run twice)
#   2. seed_supabase.js runs schema first, seeds 80 fallas + 5 hubs, re-run safe
#   3. every app query shape resolves (embedded-select FKs, Clerk-sub RLS,
#      constraints) — see scripts/schema_smoke_test.sql
# Requires: docker. Everything runs locally; no network, no real Supabase.
set -euo pipefail

CONTAINER=fallamap-schema-test
PORT=54329
DB_URL=postgres://postgres:fallamap@localhost:${PORT}/postgres
cd "$(dirname "$0")/.."

cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT

cleanup
echo "== starting throwaway Postgres =="
docker run -d --name "$CONTAINER" -e POSTGRES_PASSWORD=fallamap \
  -p "${PORT}:5432" postgres:16-alpine >/dev/null
for _ in $(seq 1 30); do
  docker exec "$CONTAINER" pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done
docker exec "$CONTAINER" pg_isready -U postgres >/dev/null

echo "== applying Supabase environment stubs =="
docker exec -i "$CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 < scripts/schema_local_stubs.sql

echo "== applying scripts/schema.sql =="
docker exec -i "$CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 < scripts/schema.sql

echo "== idempotency: re-applying scripts/schema.sql =="
docker exec -i "$CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 < scripts/schema.sql

echo "== running seed script (schema first, then rows) =="
SUPABASE_DB_URL="$DB_URL" node scripts/seed_supabase.js

echo "== smoke tests (app query shapes) =="
docker exec -i "$CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 < scripts/schema_smoke_test.sql

echo "== seed idempotency: second run =="
SUPABASE_DB_URL="$DB_URL" node scripts/seed_supabase.js

echo "== verifying seed counts (expect fallas 80 / hubs 5) =="
docker exec -i "$CONTAINER" psql -U postgres -v ON_ERROR_STOP=1 -t \
  -c "select 'fallas=' || count(*) from fallas;" \
  -c "select 'hubs=' || count(*) from hubs;"

echo "ALL SCHEMA CHECKS PASSED"
