FROM node:18-alpine AS base

# Etapa de dependencias
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Etapa de construcción
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_SERVER_ACTIONS_BODY_SIZE_LIMIT=250mb
ENV NEXT_OUTPUT=standalone

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi; \
  echo "Verificando estructura de build:"; \
  ls -la /app/.next || echo "No se encontró .next"; \
  ls -la /app/.next/standalone || echo "No se encontró standalone"; \
  # Asegurar que public se copie en standalone
  if [ -d public ]; then cp -r public /app/.next/standalone/public; fi

# Etapa de producción (runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar el output standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copiar la carpeta static
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar la carpeta public (sin operador lógico)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]


# sudo docker compose down
# sudo DOCKER_BUILDKIT=1 docker compose build --no-cache --progress=plain
# sudo docker compose up --force-recreate
