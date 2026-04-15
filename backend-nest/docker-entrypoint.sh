#!/bin/sh
set -e

export POSTGRES_PASSWORD=$(cat /run/secrets/postgres_password)
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"

echo "Generating Brand New self signed cert and key"
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 7 -nodes \
    -subj "/C=FI/ST=UUSIMAA/L=Helsinki/O=HIVE/OU=Unit/CN=localhost"

echo "Resolving database state ... "
npx prisma migrate resolve --applied 0_init 2>/dev/null || true

echo "Running database migrations..."
npx prisma migrate deploy

echo "Generating Prisma Client..."
npx prisma generate

echo "Starting application..."
exec npm run start:dev
