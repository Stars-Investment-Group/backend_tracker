#!/bin/bash
# ==============================================================================
# SCRIPT DE DEPLOIEMENT / MISE A JOUR EN PRODUCTION (VPS)
# Stars Investment Group - Backend Tracker
# ==============================================================================

set -e

# Positionnement a la racine du projet quel que soit le dossier d'appel
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

COMPOSE_FILE="deploy/docker-compose.prod.yml"
ENV_FILE=".env.production"

echo "[SIG-DEPLOY] Demarrage du deploiement en production depuis : $PROJECT_ROOT"

# 1. Verification du fichier d'environnement
if [ ! -f "$ENV_FILE" ]; then
    echo "[ERREUR] Le fichier $ENV_FILE est introuvable a la racine !"
    echo "[INFO] Creez-le a partir du template : cp deploy/.env.production.example $ENV_FILE"
    exit 1
fi

# 2. Recuperation des dernieres modifications Git
echo "[1/4] Recuperation de la derniere version du code (git pull)..."
git fetch origin main
git reset --hard origin/main

# 3. Build des conteneurs Docker
echo "[2/4] Compilation des images Docker de production..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache backend

# 4. Demarrage des conteneurs avec mise a jour continue
echo "[3/4] Demarrage de la stack de production..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --remove-orphans

# 5. Nettoyage des anciennes images inutilisees
echo "[4/4] Nettoyage des anciennes images Docker (prune)..."
docker image prune -f

# 6. Verification de la sante de l'API
echo "[INFO] Verification de l'etat de l'API..."
sleep 5
docker compose -f "$COMPOSE_FILE" ps

echo "[SIG-DEPLOY] Deploiement termine avec succes."
echo "[INFO] API accessible sur le port 80 / 443"
