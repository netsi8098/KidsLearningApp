# ============================================================
# Kids Learning Backend API - Multi-stage Dockerfile
# ============================================================

# ── Stage 1: Production dependencies ────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install only production deps (cached unless package files change)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Generate Prisma client against production node_modules
COPY prisma ./prisma/
RUN npx prisma generate

# ── Stage 2: Build TypeScript ────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Install ALL deps (including devDeps for tsc)
COPY package.json package-lock.json ./
RUN npm ci

# Generate Prisma client (needed for type resolution during build)
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source and compile
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# ── Stage 3: Production image ───────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser

# Copy production node_modules (with Prisma client)
COPY --from=deps /app/node_modules ./node_modules/

# Copy Prisma schema (needed for migrations at runtime)
COPY --from=deps /app/prisma ./prisma/

# Copy compiled JS output
COPY --from=build /app/dist ./dist/

# Copy package.json (needed for ESM module resolution)
COPY package.json ./

# Create uploads directory for local storage
RUN mkdir -p /app/uploads && chown appuser:appgroup /app/uploads

USER appuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "dist/index.js"]
