#!/bin/sh
set -e

echo " [SIG-ENTRYPOINT] Démarrage du conteneur Backend..."

# Attendre que la base de données soit prête et appliquer les migrations Prisma si en production
if [ "$NODE_ENV" = "production" ]; then
  echo " [SIG-ENTRYPOINT] Déploiement des migrations Prisma..."
  ./node_modules/.bin/prisma migrate deploy || {
    echo " [SIG-ENTRYPOINT] migrate deploy a échoué, tentative de db push..."
    ./node_modules/.bin/prisma db push --accept-data-loss
  }
fi

echo " [SIG-ENTRYPOINT] Lancement de l'application..."
exec "$@"
