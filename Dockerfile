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

# Configuración crítica para Server Actions
ENV NEXT_SERVER_ACTIONS_BODY_SIZE_LIMIT=1024mb

# Forzar modo standalone en el build
ENV NEXT_OUTPUT=standalone

# Construcción con verificación de salida
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi; \
  echo "Verificando estructura de build:"; \
  ls -la /app/.next || echo "No se encontró .next"; \
  ls -la /app/.next/standalone || echo "No se encontró standalone"

# Etapa de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar solo lo esencial
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copiar output standalone (si existe)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Solución alternativa: si no se generó standalone, usar output normal
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]


# sudo docker compose down
# sudo DOCKER_BUILDKIT=1 docker compose build --no-cache --progress=plain
# sudo docker compose up --force-recreate
