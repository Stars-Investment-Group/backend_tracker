# Guide de Deploiement en Production sur VPS

Ce guide decrit la procedure etape par etape pour deployer l'API **Stars Investment Group - Backend Tracker** sur n'importe quel serveur VPS (OVH, Hetzner, DigitalOcean, AWS EC2, Linode, Hostinger, etc.) sous **Ubuntu 22.04 / 24.04 LTS** ou **Debian 12**.

---

## Architecture Deployee

```mermaid
graph TD
    Client["Clients / Web / Mobile / Swagger"] -->|Port 80 / 443 HTTPS| Nginx["Nginx Reverse Proxy (Gzip, Rate Limit, SSL)"]
    Nginx -->|Port 3000| Backend["NestJS Backend Tracker (Node 22)"]
    Backend -->|Port 5432| Postgres[("PostgreSQL 17 (Donnees securisees)")]
    Backend -->|Port 6379| Redis[("Redis 8 (Cache & Sessions)")]
```

---

## Structure du dossier `deploy/`

Tous les artefacts d'exploitation et d'infrastructure sont centralises dans le dossier `deploy/` :
```text
backend_tracker/
├── deploy/
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── conf.d/default.conf
│   ├── scripts/
│   │   ├── setup-vps.sh        # Initialisation VPS en 1 commande
│   │   └── deploy.sh           # Deploiement et mise a jour
│   ├── docker-compose.prod.yml # Stack de production
│   ├── docker-entrypoint.sh    # Migrations automatiques Prisma
│   ├── .env.production.example # Modele de configuration de prod
│   └── DEPLOYMENT.md           # Documentation technique VPS
├── src/                        # Code source NestJS
├── Dockerfile                  # Multi-Stage Build
├── docker-compose.yml          # Dev local
├── README.md                   # Documentation generale
└── package.json
```

---

## Etape 1 : Initialisation du VPS en 1 commande

Connectez-vous en SSH a votre VPS :
```bash
ssh root@IP_DE_VOTRE_VPS
```

Clonez le projet dans `/var/www/backend_tracker` :
```bash
sudo mkdir -p /var/www
cd /var/www
git clone https://github.com/Stars-Investment-Group/backend_tracker.git
cd backend_tracker
```

Rendez les scripts executables et lancez l'initialisation automatique :
```bash
chmod +x ./deploy/scripts/*.sh
./deploy/scripts/setup-vps.sh
```

Ce que fait ce script :
- Met a jour le systeme d'exploitation.
- Configure le pare-feu UFW (ouvre les ports 22, 80 et 443 uniquement).
- Installe la derniere version officielle de Docker et Docker Compose.
- Ajuste les limites du noyau Linux (Kernel) pour les performances elevees.

---

## Etape 2 : Configuration des variables d'environnement

Copiez le modele de production vers la racine du projet :
```bash
cp deploy/.env.production.example .env.production
nano .env.production
```

Remplissez les valeurs securisees :
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://tracker.starsinvestment.com,https://app.starsinvestment.com

# Generer une cle avec: openssl rand -base64 48
JWT_SECRET=VotreCleSecreteTresLongueEtAleatoire123456789!
JWT_REFRESH_SECRET=VotreCleRefreshTokenTresLongueEtAleatoire123456789!

DB_USER=sig_prod_user
DB_PASSWORD=MotDePasseTresSecuriseDB2026!
DB_NAME=sig_tracker_prod
DATABASE_URL="postgresql://sig_prod_user:MotDePasseTresSecuriseDB2026!@postgres:5432/sig_tracker_prod?schema=public"

REDIS_PASSWORD=MotDePasseRedisTresSecurise2026!
```

---

## Etape 3 : Lancement du projet en Production

Executez le script de deploiement :
```bash
./deploy/scripts/deploy.sh
```

Verifiez l'etat des conteneurs :
```bash
docker compose -f deploy/docker-compose.prod.yml ps
```
Tous les conteneurs (`sig-tracker-backend`, `sig-tracker-postgres`, `sig-tracker-redis`, `sig-tracker-nginx`) doivent afficher le statut `Up` (ou `healthy`).

Testez le Healthcheck :
```bash
curl http://localhost/health
```
Reponse attendue :
```json
{
  "status": "ok",
  "services": {
    "api": "healthy",
    "database": { "status": "healthy", "latencyMs": 2 }
  }
}
```

---

## Etape 4 : Activer le Certificat SSL Gratuit (HTTPS Let's Encrypt)

Une fois que votre nom de domaine pointe vers l'IP du VPS :
```bash
sudo certbot certonly --webroot -w /var/www/certbot -d api.tracker.mondomaine.com --email admin@mondomaine.com --agree-tos --no-eff-email
```

---

## Etape 5 : Mises a jour futures

Pour mettre a jour le code lors d'une nouvelle version :
```bash
cd /var/www/backend_tracker
./deploy/scripts/deploy.sh
```

---

## Etape 6 (Optionnelle) : Deploiement Continu Automatique (GitHub Actions)

Pour que chaque `git push` sur `main` deploie automatiquement sur votre VPS sans intervention manuelle :

Dans votre repo GitHub : **Settings > Secrets and variables > Actions > New repository secret** :
* `VPS_HOST` : L'adresse IP de votre VPS (ex: `142.93.xxx.xxx`).
* `VPS_USERNAME` : `root` (ou votre utilisateur sudo).
* `VPS_SSH_KEY` : Votre cle privee SSH (contenu de `~/.ssh/id_rsa`).
* `VPS_PROJECT_PATH` : `/var/www/backend_tracker`.
