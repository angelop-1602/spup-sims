# ---------- Dependencies ----------
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci


# ---------- Build ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Build-time args for NEXT_PUBLIC_* vars (baked into the client bundle)
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_TENANT_ID
ARG NEXT_PUBLIC_CLIENT_ID
ARG NEXT_PUBLIC_MSAL_REDIRECT_URI
ARG NEXT_PUBLIC_API_SCOPES

ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_TENANT_ID=$NEXT_PUBLIC_TENANT_ID
ENV NEXT_PUBLIC_CLIENT_ID=$NEXT_PUBLIC_CLIENT_ID
ENV NEXT_PUBLIC_MSAL_REDIRECT_URI=$NEXT_PUBLIC_MSAL_REDIRECT_URI
ENV NEXT_PUBLIC_API_SCOPES=$NEXT_PUBLIC_API_SCOPES

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# ---------- Production ----------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]