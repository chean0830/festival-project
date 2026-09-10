# --- build stage ---------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Vite inlines VITE_* vars at build time, so they must be present now, not at runtime.
ARG VITE_KAKAO_JS_KEY
ARG VITE_TOSS_CLIENT_KEY
ENV VITE_KAKAO_JS_KEY=$VITE_KAKAO_JS_KEY
ENV VITE_TOSS_CLIENT_KEY=$VITE_TOSS_CLIENT_KEY

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- serve stage --------------------------------------------------------------
# Caddy serves the SPA and reverse-proxies API/WebSocket/OAuth to the backend.
# It also provisions HTTPS automatically for $APP_DOMAIN via Let's Encrypt.
FROM caddy:2.8-alpine AS serve
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80 443
