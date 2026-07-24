FROM node:22-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts
COPY . .
RUN sed -i 's/\r$//' scripts/docker-entrypoint.sh && chmod +x scripts/docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["scripts/docker-entrypoint.sh"]
