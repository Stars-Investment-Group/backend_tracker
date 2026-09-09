#!/bin/bash
# ==============================================================================
# SCRIPT DE DÉPLOIEMENT / MISE À JOUR EN PRODUCTION (VPS)
# Stars Investment Group - Backend Tracker
# ==============================================================================

set -e

# Positionnement à la racine du projet quel que soit le dossier d'appel
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

COMPOSE_FILE="deploy/docker-compose.prod.yml"
ENV_FILE=".env.production"

echo "🚀 [SIG-DEPLOY] Démarrage du déploiement en production depuis : $PROJECT_ROOT"

# 1. Vérification du fichier d'environnement
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ [ERREUR] Le fichier $ENV_FILE est introuvable à la racine !"
    echo "👉 Créez-le à partir du template : cp deploy/.env.production.example $ENV_FILE"
    exit 1
fi

# 2. Récupération des dernières modifications Git
echo "📥 [1/4] Récupération de la dernière version du code (git pull)..."
git fetch origin main
git reset --hard origin/main

# 3. Build des conteneurs Docker
echo "🔨 [2/4] Compilation des images Docker de production..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache backend

# 4. Démarrage des conteneurs avec mise à jour continue
echo "🔄 [3/4] Démarrage de la stack de production..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --remove-orphans

# 5. Nettoyage des anciennes images inutilisées
echo "🧹 [4/4] Nettoyage des anciennes images Docker (prune)..."
docker image prune -f

# 6. Vérification de la santé de l'API
echo "🩺 Vérification de l'état de l'API..."
sleep 5
docker compose -f "$COMPOSE_FILE" ps

echo "🎉 [SIG-DEPLOY] Déploiement terminé avec succès !"
echo "🌐 API accessible sur le port 80 / 443"
