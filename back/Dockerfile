FROM node:22-alpine
RUN corepack enable
WORKDIR /app

ARG LICENSE_HASH=unknown
ARG BUILD_DATE=unknown

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts && pnpm run build
RUN echo "{\"licenseHash\":\"${LICENSE_HASH}\",\"buildDate\":\"${BUILD_DATE}\",\"version\":\"34\"}" > dist/watermark.json
RUN sed -i 's/\r$//' scripts/docker-entrypoint.sh && chmod +x scripts/docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["scripts/docker-entrypoint.sh"]
