FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS install

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY prisma ./prisma
RUN bun prisma generate

FROM base AS release

COPY --from=install /app/node_modules ./node_modules
COPY . .

ENTRYPOINT ["sh", "-c", "bun prisma migrate deploy && bun start"]
