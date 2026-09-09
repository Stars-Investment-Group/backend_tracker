#!/bin/bash
# ==============================================================================
# SCRIPT D'INITIALISATION D'UN VPS VIERGE (Ubuntu 22.04 / 24.04 LTS ou Debian 12)
# Stars Investment Group - Backend Tracker
# ==============================================================================

set -e

echo "🚀 [SIG-VPS-SETUP] Démarrage de l'installation du serveur VPS..."

# 1. Mise à jour du système
echo "📦 [1/6] Mise à jour des paquets système..."
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git ufw apt-transport-https ca-certificates gnupg lsb-release dumb-init certbot

# 2. Configuration du Firewall (UFW)
echo "🔒 [2/6] Configuration du Firewall (UFW)..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
echo "y" | sudo ufw enable

# 3. Installation de Docker & Docker Compose
echo "🐳 [3/6] Installation du moteur Docker officiel..."
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER
    echo "✅ Docker installé avec succès."
else
    echo "✅ Docker est déjà installé."
fi

# 4. Création des répertoires de stockage
echo "📁 [4/6] Création des dossiers du projet..."
sudo mkdir -p /var/www/certbot
sudo mkdir -p /etc/letsencrypt

# 5. Optimisation des limites système (Kernel)
echo "⚙️ [5/6] Configuration des paramètres Kernel pour haute performance..."
sudo sysctl -w vm.max_map_count=262144
sudo sysctl -w fs.file-max=65536
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
echo "fs.file-max=65536" | sudo tee -a /etc/sysctl.conf

echo "🎉 [6/6] Initialisation du VPS terminée avec succès !"
echo "👉 Vous pouvez maintenant cloner le repo et exécuter './deploy/scripts/deploy.sh'"
