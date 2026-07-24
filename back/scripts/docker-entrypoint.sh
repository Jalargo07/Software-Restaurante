#!/bin/sh
set -e
cd /app
echo "Ejecutando seed..."
node dist/scripts/seed.js
echo "Arrancando servidor..."
exec pnpm start
