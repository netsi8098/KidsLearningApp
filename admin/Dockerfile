# ============================================================
# Kids Learning Admin Dashboard - Multi-stage Dockerfile
# ============================================================

# ── Stage 1: Build the Vite app ─────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy config files needed for build
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY index.html ./

# Copy source
COPY src ./src/

# Build the production bundle
RUN npm run build

# ── Stage 2: Serve with nginx ───────────────────────────────
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
