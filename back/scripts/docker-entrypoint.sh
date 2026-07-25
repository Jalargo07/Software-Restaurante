#!/bin/sh
set -e
cd /app

# Solo ejecutar seed en desarrollo o si se fuerza explícitamente
if [ "$RUN_SEED" = "true" ] || [ "$NODE_ENV" != "production" ]; then
  echo "Ejecutando seed..."
  node dist/scripts/seed.js
else
  echo "Seed omitido (producción). Usando base de datos existente."
fi

echo "Arrancando servidor..."
exec pnpm start
