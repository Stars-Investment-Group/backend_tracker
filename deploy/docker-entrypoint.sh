#!/bin/sh
set -e

echo "[SIG-ENTRYPOINT] Demarrage du conteneur Backend..."

# Attendre que la base de donnees soit prete et appliquer les migrations Prisma si en production
if [ "$NODE_ENV" = "production" ]; then
  echo "[SIG-ENTRYPOINT] Deploiement des migrations Prisma..."
  ./node_modules/.bin/prisma migrate deploy || {
    echo "[SIG-ENTRYPOINT] [WARN] migrate deploy a echoue, tentative de db push..."
    ./node_modules/.bin/prisma db push --accept-data-loss
  }
fi

echo "[SIG-ENTRYPOINT] Lancement de l'application..."
exec "$@"
