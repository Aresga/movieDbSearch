#!/bin/sh
set -e

echo "Resolving database state ... "
npx prisma migrate resolve --applied 0_init 2>/dev/null || true

echo "Running database migrations..."
npx prisma migrate deploy

echo "Generating Prisma Client..."
npx prisma generate

echo "Starting application..."
exec npm run start:dev
