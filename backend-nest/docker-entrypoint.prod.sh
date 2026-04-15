#!/bin/sh
set -e

if [ -n "$POSTGRES_PASSWORD" ]; then
  DB_PASSWORD="$POSTGRES_PASSWORD"
elif [ -f /run/secrets/postgres_password ]; then
  DB_PASSWORD="$(cat /run/secrets/postgres_password)"
else
  echo "postgres password is missing; set POSTGRES_PASSWORD or mount /run/secrets/postgres_password" >&2
  exit 1
fi

export DATABASE_URL="postgresql://${POSTGRES_USER}:${DB_PASSWORD}@postgres:5432/${POSTGRES_DB}"

echo "Running database migrations..."

set +e
MIGRATE_OUTPUT=$(npx prisma migrate deploy 2>&1)
MIGRATE_EXIT=$?
set -e

if [ $MIGRATE_EXIT -ne 0 ]; then
  echo "$MIGRATE_OUTPUT"

  # Existing populated DB with no migration history table.
  if echo "$MIGRATE_OUTPUT" | grep -q "P3005"; then
    echo "Detected baseline database state (P3005). Marking 0_init as already applied..."
    npx prisma migrate resolve --applied 0_init

    echo "Re-running migrations after baseline resolve..."
    npx prisma migrate deploy
  else
    echo "Prisma migration failed with a non-baseline error." >&2
    exit $MIGRATE_EXIT
  fi
fi

echo "Starting application in production mode..."
exec npm run start:prod
