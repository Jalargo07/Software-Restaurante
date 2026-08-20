#!/bin/sh
set -e
cd /app

# Resolver IPv4 para DATABASE_URL (fix Supabase + Render ENETUNREACH)
if [ -n "$DATABASE_URL" ]; then
  DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
  DB_IP=$(DB_HOST="$DB_HOST" node -e "
    const dns = require('dns');
    const host = process.env.DB_HOST;
    dns.resolve4(host, (err, addrs) => {
      if (err || !addrs.length) process.exit(1);
      process.stdout.write(addrs[0]);
    });
  " 2>/dev/null) || true
  if [ -n "$DB_IP" ]; then
    export DATABASE_URL=$(echo "$DATABASE_URL" | sed "s|$DB_HOST|$DB_IP|")
    echo "DNS: resolved $DB_HOST -> IPv4: $DB_IP"
  else
    echo "DNS: could not resolve IPv4 for $DB_HOST, using original"
  fi
fi

# Seed script solo con RUN_SEED=explicit
if [ "$RUN_SEED" = "true" ]; then
  echo "Ejecutando seed..."
  node dist/scripts/seed.js
else
  echo "Seed omitido. Usando server seed para datos iniciales."
fi

echo "Arrancando servidor..."
exec node --dns-result-order=ipv4first dist/server.js
