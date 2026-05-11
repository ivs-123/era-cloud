FROM node:22-alpine AS api-builder
WORKDIR /app
COPY package*.json tsconfig.base.json ./
COPY packages/common ./packages/common
COPY apps/api ./apps/api
RUN npm ci --workspaces --if-present
RUN npm run build --workspace @era/common
RUN npm run build --workspace @era/api
FROM node:22-alpine AS api
WORKDIR /app
COPY --from=api-builder /app/node_modules ./node_modules
COPY --from=api-builder /app/packages/common/dist ./packages/common/dist
COPY --from=api-builder /app/apps/api/dist ./apps/api/dist
COPY --from=api-builder /app/apps/api/package.json ./apps/api/package.json
COPY infra ./infra
ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=4000
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]

FROM node:22-alpine AS web-builder
WORKDIR /app
COPY package*.json tsconfig.base.json ./
COPY packages/common ./packages/common
COPY apps/web ./apps/web
RUN npm ci --workspaces --if-present
RUN npm run build --workspace @era/common
RUN npm run build --workspace @era/web
FROM node:22-alpine AS web
WORKDIR /app
COPY --from=web-builder /app/node_modules ./node_modules
COPY --from=web-builder /app/apps/web/.next ./apps/web/.next
COPY --from=web-builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=web-builder /app/apps/web/next.config.mjs ./apps/web/next.config.mjs
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "apps/web/node_modules/.bin/next", "start", "-p", "3000"]
