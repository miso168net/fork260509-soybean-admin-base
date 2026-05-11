# syntax=docker/dockerfile:1.7

#################################################
# Stage 1: builder — pnpm install + vite build
#################################################
ARG NODE_VERSION=22-alpine
ARG NGINX_VERSION=1.27-alpine
ARG PNPM_VERSION=10.5.0

FROM node:${NODE_VERSION} AS builder
ARG PNPM_VERSION

# admin-web Vite build args（per research.md R6；compose 從 .env 帶入）
ARG VITE_BASE_URL=/
ARG VITE_SERVICE_BASE_URL=/api
ARG VITE_APP_TITLE=NewAdmin
ARG VITE_AUTH_ROUTE_MODE=static
ARG VITE_STATIC_SUPER_ROLE=R_SUPER

# 把 ARG 升級為 ENV，讓 Vite build 時 process.env.VITE_* 拿得到（覆蓋 .env.prod 內 mock URL）
ENV VITE_BASE_URL=${VITE_BASE_URL} \
    VITE_SERVICE_BASE_URL=${VITE_SERVICE_BASE_URL} \
    VITE_APP_TITLE=${VITE_APP_TITLE} \
    VITE_AUTH_ROUTE_MODE=${VITE_AUTH_ROUTE_MODE} \
    VITE_STATIC_SUPER_ROLE=${VITE_STATIC_SUPER_ROLE}

WORKDIR /app

# Pin pnpm 版本（reproducibility）+ store 設到固定路徑搭配 BuildKit cache mount
RUN npm install -g pnpm@${PNPM_VERSION} && \
    pnpm config set store-dir /pnpm/store

# 先 COPY lockfile + package manifest + .npmrc（讓 deps 變動才重 install layer）
# build context = outer 倉根（compose.yaml line 108: context: ..）
# .npmrc 必須在 install 前就位：含 shamefully-hoist=true；否則 build/plugins/unocss.ts
# 引用的 @iconify/utils（@iconify/vue 之 transitive dep）不會 hoist 到 top-level
# node_modules，後續 vite build 會 ERR_MODULE_NOT_FOUND
COPY admin-web/package.json admin-web/pnpm-lock.yaml admin-web/.npmrc ./

# BuildKit cache mount（id=pnpm 跨 build 持久化）— pnpm store 重用，避免每次 install
# 都要重新從 registry 拉 tarball；只有 lockfile 真實變動才需網路下載新增/異動的套件
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# COPY 其餘 source（.dockerignore 已排除 node_modules / dist / .git）
COPY admin-web/ ./

# Vite production build → /app/dist
RUN pnpm build

#################################################
# Stage 2: runtime — nginx serve static + /api proxy
#################################################
FROM nginx:${NGINX_VERSION} AS runtime

# COPY built dist → nginx html dir
COPY --from=builder /app/dist /usr/share/nginx/html

# COPY 既有 nginx config（feature 1 deploy/nginx/default.conf，已含 SPA fallback + /api proxy + cache + gzip）
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf

# OCI image labels
LABEL org.opencontainers.image.title="new-admin-base-web" \
      org.opencontainers.image.description="SoybeanAdmin frontend served by nginx" \
      org.opencontainers.image.source="https://github.com/miso168net/fork260509-soybean-admin"

# 對外暴露 80（compose 映射 ${WEB_PORT:-8080}:80）
EXPOSE 80

# 健康檢查（呼叫 nginx /health endpoint，由 default.conf 提供）
HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=5s \
  CMD wget --spider --quiet http://localhost/health || exit 1

# nginx 預設 CMD = ["nginx", "-g", "daemon off;"]，繼承 nginx:alpine
