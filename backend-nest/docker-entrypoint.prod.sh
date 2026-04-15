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
npx prisma migrate deploy

echo "Starting application in production mode..."
exec npm run start:prod
