# =============================================================================
# base-web Dockerfile — rev1 deploy 版本(W-F2)
#
# 新建檔 — base-web 源倉無既有 Dockerfile。
#
# 設計要點:
# - builder node:22-slim(>=20.19 滿足、22 LTS、per spec FR-002)
# - runtime nginx:1.27-alpine(image ~30MB,per spec FR-008 + Q1 brainstorm)
# - corepack 從 package.json packageManager field 自動讀 pnpm 版本(per 049 FR-005)
# - deps-first COPY + BuildKit cache mount /root/.local/share/pnpm/store(per FR-004/005)
# - VITE_* ARG/ENV 在 build time override .env.prod(per Q2 / FR-006)
# - nginx alpine 內建 nginx user(uid=101)、直接 USER 切換、無需 useradd(per FR-013)
# - 不在 W-F2 範疇:compose / secret / TLS / front-nginx / 對外 port forward / multi-arch
# =============================================================================

ARG NODE_VERSION=22
ARG NGINX_VERSION=1.27
ARG APP_PORT=8080
ARG TZ=Asia/Shanghai
ARG VITE_SERVICE_BASE_URL=/api
ARG VITE_SERVICE_SUCCESS_CODE=0

# -----------------------------------------------------------------------------
# Stage 1: builder
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

# corepack 自動讀 base-web/package.json packageManager field、pnpm 版本由此提供
RUN corepack enable

# Deps-first COPY layer — per FR-004 / R-005:先 COPY package manifests + workspace
# sub-packages + .npmrc + pnpm-workspace.yaml 觸發 BuildKit layer cache;source
# 變動但 dep 未變時可命中 cache。
# pnpm 11+ 預設 strict isolation 紀律 (per 049 FR-004/005):
# - package.json packageManager field 是唯一 pnpm 版本 source of truth
#   (host + container 共享、取代 047.5 retro 期間的 Dockerfile ARG)
# - 4 phantom transitive 已提為 explicit devDeps、無需 hoist
# - --ignore-scripts 保留: pnpm 11 strict mode 拒絕 transitive build script
#   (esbuild / simple-git-hooks / unrs-resolver / etc.)、container 無互動 shell
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/ packages/

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# Source + build with build-arg env override(per Q2 clarify / FR-006)
COPY . .

ARG VITE_SERVICE_BASE_URL
ARG VITE_SERVICE_SUCCESS_CODE
ENV VITE_SERVICE_BASE_URL=$VITE_SERVICE_BASE_URL
ENV VITE_SERVICE_SUCCESS_CODE=$VITE_SERVICE_SUCCESS_CODE

RUN pnpm build

# -----------------------------------------------------------------------------
# Stage 2: runtime
# -----------------------------------------------------------------------------
FROM nginx:${NGINX_VERSION}-alpine AS runtime

ARG APP_PORT
ARG TZ

RUN apk add --no-cache tzdata curl && \
    ln -sf /usr/share/zoneinfo/${TZ} /etc/localtime && \
    # nginx user(uid 101)需可寫 pid + 5 個 cache temp subdir(client_temp / proxy_temp /
    # fastcgi_temp / uwsgi_temp / scgi_temp)— nginx 啟動時 mkdir 這些 dir,若 parent
    # owned by root 則 nginx user permission denied → emerg + exit
    mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp /var/cache/nginx/scgi_temp && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx

COPY --from=builder /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

USER nginx
EXPOSE ${APP_PORT}

ENV TZ=${TZ}

CMD ["nginx", "-g", "daemon off;"]
