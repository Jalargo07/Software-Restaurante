#!/bin/sh
set -e
cd /app
echo "Ejecutando seed..."
pnpm run seed
echo "Arrancando servidor..."
exec pnpm start
