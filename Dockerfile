# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source and build the static production bundle
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine AS runtime

# Custom nginx config for a single-page app
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
