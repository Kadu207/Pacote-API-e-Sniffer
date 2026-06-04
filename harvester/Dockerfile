# API Harvester — dev e build (Bun)
FROM oven/bun:1.3-alpine

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=development
EXPOSE 8080

# Dev: vite em 0.0.0.0:8080 (ver vite.config.ts)
CMD ["bun", "run", "dev"]
