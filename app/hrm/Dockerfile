# syntax=docker/dockerfile:1.7

# ---------- Dependencies ----------
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci


# ---------- Build ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Build-time args for NEXT_PUBLIC_* vars (baked into the client bundle)
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_TENANT_ID
ARG NEXT_PUBLIC_CLIENT_ID
ARG NEXT_PUBLIC_MSAL_REDIRECT_URI
ARG NEXT_PUBLIC_API_SCOPES

ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME \
    NEXT_PUBLIC_TENANT_ID=$NEXT_PUBLIC_TENANT_ID \
    NEXT_PUBLIC_CLIENT_ID=$NEXT_PUBLIC_CLIENT_ID \
    NEXT_PUBLIC_MSAL_REDIRECT_URI=$NEXT_PUBLIC_MSAL_REDIRECT_URI \
    NEXT_PUBLIC_API_SCOPES=$NEXT_PUBLIC_API_SCOPES \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Cache npm's download cache and Next's incremental build cache across
# builds so unchanged dependencies/pages don't get redone from scratch.
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/.next/cache \
    npm run build


# ---------- Production ----------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# `output: "standalone"` traces only the files actually needed at runtime,
# so we no longer copy the full node_modules tree into the final image.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
