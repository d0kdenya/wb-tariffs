FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig*.json nest-cli.json ./
COPY knexfile.ts ./
COPY src ./src
COPY migrations ./migrations

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations
COPY knexfile.ts ./

EXPOSE 3000

CMD ["node", "dist/src/main.js"]