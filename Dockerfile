# ==============================================================================
# STAGE 1: Base - Environnement Node.js & outils de base
# ==============================================================================
FROM node:22-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    dumb-init \
    curl \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# ==============================================================================
# STAGE 2: Development - Environnement pour le développement local
# ==============================================================================
FROM base AS dev
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma generate

EXPOSE 3000
CMD ["pnpm", "start:dev"]

# ==============================================================================
# STAGE 3: Builder - Compilation TypeScript & génération des artefacts
# ==============================================================================
FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma generate
RUN pnpm build
RUN pnpm prune --prod

# ==============================================================================
# STAGE 4: Production Runner - Image finale ultra-légère & sécurisée
# ==============================================================================
FROM base AS runner

ENV NODE_ENV=production
WORKDIR /app

# Copie des scripts d'entrée et artefacts nécessaires
COPY deploy/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copie des fichiers compilés et dépendances de production
COPY --chown=node:node package.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

# Sécurité: Exécution avec utilisateur non-root
USER node

EXPOSE 3000

# Healthcheck Docker natif
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
